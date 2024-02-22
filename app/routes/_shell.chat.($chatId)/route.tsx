import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";
import { useActionData, useLoaderData } from "@remix-run/react";
import * as React from "react";

import { requireUser } from "@/lib/auth.server";
import { addMessage, createChat, getChat } from "@/lib/chats.server";
import { PublicError, formIntent } from "@/lib/forms.server";

import {
	ChatBottomBar,
	AnimatedMessages,
	ChatMessage,
	ChatTopBar,
} from "./chat";
import { Intents, sendMessageFormSchema, useSendMessageForm } from "./form";
import { createConversationChain } from "./ai";

export async function loader({
	context,
	params: { chatId },
	request,
}: LoaderFunctionArgs) {
	const user = await requireUser(context, request);

	const chat = chatId ? await getChat(context, user.id, chatId) : null;

	return { chat };
}

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

			const conversation = createConversationChain(
				context,
				prompt,
				history ?? [],
			);
			const aiResponse = await conversation.invoke({ question: message });
			const aiMessage = aiResponse.content.toString().trim();

			if (!chat) {
				chat = await createChat(context, user.id, {
					message: message,
					name: message.slice(0, 36) + (message.length > 36 ? "..." : ""),
				});
				if (!chat) {
					throw new PublicError(
						history ? "Could not send message" : "Could not create chat",
					);
				}
			} else {
				await addMessage(context, chat.id, message, user.id);
			}

			await addMessage(context, chat.id, aiMessage);

			if (!chatId) {
				throw redirect(`/chat/${chat.id}`);
			}

			return null;
		})
		.run();
}

export default function Chat() {
	const { chat } = useLoaderData<typeof loader>();
	const { sendMessage } = useActionData<typeof action>() ?? {};
	const messagesRef = React.useRef<HTMLDivElement>(null);

	const messages = chat?.messages || [];

	const [sendMessageForm, sendMessageFields] = useSendMessageForm(
		sendMessage?.lastResult,
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	React.useEffect(() => {
		if (messagesRef.current) {
			messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
		}
	}, [messages]);

	return (
		<div className="flex flex-col justify-between w-full h-full">
			<ChatTopBar chatId={chat?.id} chatName={chat?.name} />

			<div className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col">
				<div
					ref={messagesRef}
					className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col"
				>
					<AnimatedMessages>
						{messages.map((message, i) => (
							<ChatMessage
								key={message.id}
								avatar={
									message.sender === "AI"
										? `https://random-image-pepebigotes.vercel.app/api/random-image?chat=${chat?.id}`
										: "https://random-image-pepebigotes.vercel.app/api/random-image?user"
								}
								position={message.sender === "AI" ? "left" : "right"}
								sender={message.sender}
							>
								{message.message}
							</ChatMessage>
						))}
					</AnimatedMessages>
				</div>
				<ChatBottomBar chatId={chat?.id} />
			</div>
		</div>
	);
}
