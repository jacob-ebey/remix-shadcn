import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";
import {
	ClientActionFunctionArgs,
	useFetcher,
	useLoaderData,
	useNavigate,
	useRevalidator,
	useSearchParams,
} from "@remix-run/react";
import * as React from "react";
import { z } from "zod";

import { DEFAULT_SYSTEM_PROMPT } from "@/config.shared";
import {
	sendMessageFormSchema,
	updateChatSettingsFormSchema,
} from "@/forms/chat";
import { Intents } from "@/intents";
import { getAgents } from "@/lib/agents.server";
import { createConversationChain } from "@/lib/ai";
import { requireUser } from "@/lib/auth.server";
import {
	type ChatMessage as Message,
	ChatSettings,
	addMessage,
	clearChats,
	createChat,
	getChat,
	getGlobalChatSettings,
	updateChatSettings,
} from "@/lib/chats.server";
import { PublicError, formIntent } from "@/lib/forms";
import { sendMessage } from "@/routes/api.chat.($chatId)/client";

import {
	AnimatedMessages,
	ChatBottomBar,
	ChatMessage,
	ChatTopBar,
	StreamingBotMessage,
} from "./chat";

export async function loader({
	context,
	params: { chatId },
	request,
}: LoaderFunctionArgs) {
	const user = await requireUser(context, request);

	const agentsPromise = getAgents(context, user.id);
	const chatPromise = chatId ? getChat(context, user.id, chatId) : null;
	const settingsPromise = getGlobalChatSettings(context, user.id);

	const [agents, chat, settings] = await Promise.all([
		agentsPromise,
		chatPromise,
		settingsPromise,
	]);

	return {
		agents,
		chat,
		defaultPrompt: chat?.settings.prompt || settings?.prompt,
	};
}

export async function action({
	context,
	params: { chatId },
	request,
}: ActionFunctionArgs) {
	const user = await requireUser(context, request);

	const formData = await request.formData();

	return formIntent(formData)
		.intent(Intents.ClearChats, z.any(), async () => {
			await clearChats(context, user.id);
		})
		.intent(
			Intents.UpdateChatSettings,
			updateChatSettingsFormSchema,
			async ({ agentId, prompt }) => {
				if (!chatId) throw new Error("Chat ID is required");
				return await updateChatSettings(context, user.id, chatId, {
					agentId,
					prompt,
				});
			},
		)
		.intent(
			Intents.SendMessage,
			sendMessageFormSchema,
			async ({ agent: formAgent, prompt: formPrompt, message }) => {
				const chatPromise = chatId ? getChat(context, user.id, chatId) : null;
				const settingsPromise = getGlobalChatSettings(context, user.id);

				let [chat, settings] = await Promise.all([
					chatPromise,
					settingsPromise,
				]);

				const agent = chat?.settings.agentId || formAgent;

				const prompt =
					formPrompt ||
					chat?.settings.prompt ||
					settings?.prompt ||
					DEFAULT_SYSTEM_PROMPT;

				const history = chat?.messages.map<["ai" | "human", string]>(
					({ message, sender }) => [sender ? "human" : "ai", message],
				);

				const conversation = await createConversationChain(
					context,
					user.id,
					prompt,
					agent,
					history ?? [],
					request.signal,
				);
				const aiResponse = await conversation.invoke({ prompt: message });
				const aiMessage = aiResponse.content.toString().trim();

				if (!chat) {
					chat = await createChat(context, user.id, {
						agent,
						message: message,
						name: message.slice(0, 36) + (message.length > 36 ? "..." : ""),
						prompt: formPrompt,
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
			},
		)
		.run();
}

export async function clientAction({
	params: { chatId },
	request,
	serverAction,
}: ClientActionFunctionArgs) {
	const formData = await request.clone().formData();

	if (!chatId && formData.get("intent") === Intents.UpdateChatSettings) {
		return {
			[Intents.UpdateChatSettings]: {
				lastResult: {},
				lastReturn: {
					prompt: String(formData.get("prompt")),
				},
			},
		};
	}

	const result = await formIntent(formData)
		.intent(Intents.SendMessage, sendMessageFormSchema, async () => {
			return await sendMessage(chatId, formData);
		})
		.run(true);

	return result || serverAction<typeof action>();
}

export default function Chat() {
	const { agents, chat, defaultPrompt } = useLoaderData<typeof loader>();
	const [searchParams] = useSearchParams();

	const messages = usePendingMessages(chat?.id, chat?.messages || []);
	const updatedSettingsFetcher = useFetcher<typeof clientAction>({
		key: `updated-chat-settings-${chat?.id || ""}`,
	});
	const prompt =
		(
			updatedSettingsFetcher.data?.updateChatSettings
				?.lastReturn as ChatSettings
		)?.prompt || defaultPrompt;

	const messagesRef = React.useRef<HTMLDivElement>(null);
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	React.useEffect(() => {
		if (messagesRef.current) {
			messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
		}
	}, [messages]);

	return (
		<div className="flex flex-col justify-between w-full h-full min-w-[84vw] sm:min-w-fit">
			<ChatTopBar
				selectedAgentId={
					chat?.settings?.agentId || searchParams.get("agent") || ""
				}
				agents={agents}
				chatId={chat?.id}
				chatName={chat?.name}
				systemPrompt={prompt}
			/>
			<SuccessRevalidator />

			<div className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col">
				<div
					id="messages"
					ref={messagesRef}
					className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col"
				>
					<AnimatedMessages>
						{messages.map((message, i) =>
							typeof message.message === "string" ? (
								<ChatMessage
									key={message.id}
									avatar={
										message.sender === "AI"
											? `https://random-image-pepebigotes.vercel.app/api/random-image?chat=${
													chat?.id || ""
											  }`
											: "https://random-image-pepebigotes.vercel.app/api/random-image?user"
									}
									position={message.sender === "AI" ? "left" : "right"}
									sender={message.sender}
								>
									{message.message}
								</ChatMessage>
							) : (
								message.message
							),
						)}
					</AnimatedMessages>
				</div>
				<ChatBottomBar
					agentId={!chat ? searchParams.get("agent") : chat.settings.agentId}
					chatId={chat?.id}
					prompt={prompt}
				/>
			</div>
		</div>
	);
}

type UIMessage = Omit<Message, "message"> & {
	message: string | React.ReactNode;
};

function usePendingMessages(
	chatId: string | undefined,
	initialMessages: Message[],
): UIMessage[] {
	const fetcher = useFetcher<typeof clientAction>({ key: "send-message" });
	const navigate = useNavigate();

	React.useEffect(() => {
		if (
			fetcher.state === "idle" &&
			fetcher.data?.sendMessage?.lastReturn?.redirectTo
		) {
			navigate(fetcher.data.sendMessage.lastReturn.redirectTo, {
				replace: true,
			});
		}
	}, [fetcher, navigate]);

	const messages = [...initialMessages];

	const messageIds = new Map(
		messages.map((message, index) => [message.id, { index, message }]),
	);

	const pendingMessages: UIMessage[] = [...messages];

	const data = fetcher.data?.sendMessage?.lastReturn as
		| NonNullable<
				Awaited<ReturnType<typeof clientAction>>["sendMessage"]
		  >["lastReturn"]
		| undefined;

	const createdAt = new Date().toISOString();

	const showPendingMessage =
		fetcher.formData?.get("intent") === Intents.SendMessage ||
		(!!data && data.chatId === chatId && !messageIds.has(data.sentMessageId));
	if (showPendingMessage) {
		pendingMessages.push({
			createdAt,
			id: data?.sentMessageId || "pending-human",
			message: String(fetcher.formData?.get("message") || data?.sentMessage),
			sender: "human",
		});
	}

	if (chatId && data && data.chatId !== chatId) {
		return pendingMessages;
	}

	const aiMessageIndex = messageIds.get(data?.aiMessageId || "")?.index ?? -1;

	if (
		chatId &&
		data?.next &&
		!messageIds.get(data.aiMessageId)?.message?.message?.trim()
	) {
		const pendingAiMessage = {
			createdAt,
			id: "pending-ai",
			sender: "AI",
			message: (
				<StreamingBotMessage
					key="pending-ai"
					avatar={`https://random-image-pepebigotes.vercel.app/api/random-image?chat=${
						chatId || ""
					}`}
					next={data.next}
				/>
			),
		};
		if (aiMessageIndex === -1) {
			pendingMessages.push(pendingAiMessage);
		} else {
			pendingMessages[aiMessageIndex] = pendingAiMessage;
		}
	} else if (
		showPendingMessage ||
		fetcher.formData?.get("intent") === Intents.SendMessage
	) {
		pendingMessages.push({
			createdAt,
			id: "pending-ai",
			sender: "AI",
			message: "AI is thinking...",
		});
	}

	return pendingMessages;
}

function SuccessRevalidator() {
	const fetcher = useFetcher<typeof clientAction>({ key: "send-message" });
	const { revalidate } = useRevalidator();

	const { success } = fetcher.data?.sendMessage?.lastReturn || {};
	React.useEffect(() => {
		let aborted = false;

		success?.then((success) => {
			if (aborted) return;
			if (success) {
				revalidate();
			}
		});

		return () => {
			aborted = true;
		};
	}, [success, revalidate]);

	return null;
}
