import type { BaseMessageChunk } from "@langchain/core/messages";
import type { ActionFunctionArgs } from "@remix-run/cloudflare";

import { requireUser } from "@/lib/auth.server";
import {
	addMessage,
	createChat,
	deleteMessage,
	getChat,
	updateMessage,
} from "@/lib/chats.server";
import { PublicError, formIntent } from "@/lib/forms.server";

import { createConversationChain } from "@/routes/_shell.chat.($chatId)/ai";
import {
	Intents,
	sendMessageFormSchema,
} from "@/routes/_shell.chat.($chatId)/form";

export async function action({
	context,
	params: { chatId },
	request,
}: ActionFunctionArgs) {
	const user = await requireUser(context, request);

	const formData = await request.formData();

	return formIntent(formData)
		.intent(Intents.SendMessage, sendMessageFormSchema, async ({ message }) => {
			let chat = chatId ? await getChat(context, user.id, chatId) : null;

			const prompt = chat?.settings.prompt || "";

			const history = chat?.messages.map<["ai" | "human", string]>(
				({ message, sender }) => [sender ? "human" : "ai", message],
			);

			let sentMessageId: string | undefined;
			if (!chat) {
				chat = await createChat(context, user.id, {
					message: message,
					name: message.slice(0, 36) + (message.length > 36 ? "..." : ""),
				});
				sentMessageId = chat?.messages[0]?.id;
			} else {
				const newMessage = await addMessage(context, chat.id, message, user.id);
				sentMessageId = newMessage?.id;
			}
			if (!chat || !sentMessageId) {
				throw new PublicError(
					history ? "Could not send message" : "Could not create chat",
				);
			}

			const conversation = createConversationChain(
				context,
				prompt,
				history ?? [],
			);

			const aiResponse = await conversation.stream({ question: message });

			const chatIdToModify = chat.id;
			let aiMessage = "";
			const createdAiMessage = await addMessage(
				context,
				chatIdToModify,
				aiMessage,
			);
			if (!createdAiMessage) {
				throw new PublicError("Could not create AI message");
			}

			const onAbort = () => {
				deleteMessage(context, createdAiMessage.id);
			};
			request.signal.addEventListener("abort", onAbort, { once: true });

			const encoder = new TextEncoder();
			const body = aiResponse.pipeThrough(
				new TransformStream<BaseMessageChunk, Uint8Array>({
					async transform(chunk, controller) {
						const value = chunk.content.toString();
						if (!aiMessage) {
							aiMessage = value.trim();
						} else {
							aiMessage += value;
						}
						controller.enqueue(encoder.encode(value));
					},
					async flush(controller) {
						request.signal.removeEventListener("abort", onAbort);
						try {
							await updateMessage(context, createdAiMessage.id, aiMessage);
							controller.enqueue(encoder.encode("\0\nsuccess"));
						} catch (reason) {
							console.error(reason);
							controller.enqueue(encoder.encode("\0\nfailure"));
						}
					},
				}),
			);

			return new Response(body, {
				headers: {
					"Content-Type": "text/plain",
					"Transfer-Encoding": "chunked",
					"X-Ai-Message-Id": createdAiMessage.id,
					"X-Chat-Id": chat.id,
					"X-Sent-Message": message,
					"X-Sent-Message-Id": sentMessageId,
					"X-Redirect": chatId ? "" : `/chat/${chat.id}`,
				},
			});
		})
		.run();
}
