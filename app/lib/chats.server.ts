import { AppLoadContext } from "@remix-run/cloudflare";
import { and, asc, desc, eq } from "drizzle-orm";

import {
	chat,
	chatMessage,
	chatSettings,
	globalChatSettings,
} from "@/db.server/schema";
import { getUserById } from "@/lib/user.server";

export interface ChatSummary {
	id: string;
	name: string;
	lastMessage?: {
		message: string;
		sender: string;
	};
}

export async function clearChats({ DB }: AppLoadContext, userId: string) {
	const result = await DB.delete(chat).where(eq(chat.userId, userId));
	return result.success;
}

export async function createChat(
	context: AppLoadContext,
	userId: string,
	{
		agent,
		message,
		name: inputName,
		prompt,
	}: {
		agent?: string | null;
		message: string;
		name?: string | null;
		prompt?: string;
	},
): Promise<Chat | null> {
	const name = inputName || message.slice(36);

	const newChats = await context.DB.insert(chat)
		.values({
			name,
			userId,
		})
		.returning({ id: chat.id });
	const newChat = newChats[0];
	if (!newChat) return null;

	try {
		const newMessage = await context.DB.insert(chatMessage).values({
			chatId: newChat.id,
			message: message,
			userId,
		});
		if (!newMessage.success) throw new Error("Could not create message");

		if (prompt || agent) {
			const newSettings = await context.DB.insert(chatSettings).values({
				chatId: newChat.id,
				prompt: prompt || null,
				agentId: agent || null,
			});
			if (!newSettings.success) throw new Error("Could not create settings");
		}
	} catch (error) {
		try {
			await context.DB.delete(chat).where(eq(chat.id, newChat.id));
		} catch {}
		throw error;
	}

	return getChat(context, userId, newChat.id);
}

export async function getChatsByUserId(
	{ DB }: AppLoadContext,
	userId: string,
): Promise<ChatSummary[]> {
	const chats = await DB.query.chat.findMany({
		where: eq(chat.userId, userId),
		orderBy: desc(chat.createdAt),
		columns: {
			id: true,
			name: true,
		},
		with: {
			messages: {
				limit: 1,
				orderBy: desc(chatMessage.createdAt),
				columns: {
					id: true,
					message: true,
				},
				with: {
					sender: {
						columns: {
							displayName: true,
						},
					},
				},
			},
		},
	});

	return chats.map((chat) => {
		const lastMessage = chat.messages[0];
		return {
			id: chat.id,
			name: chat.name,
			lastMessage: lastMessage
				? {
						message: lastMessage.message,
						sender: lastMessage.sender ? lastMessage.sender.displayName : "AI",
				  }
				: undefined,
		};
	});
}

export interface ChatMessage {
	id: string;
	message: string;
	createdAt: string;
	sender: string;
}

export interface ChatSettings {
	agentId?: string;
	prompt?: string;
}

export interface Chat {
	id: string;
	name: string;
	messages: ChatMessage[];
	settings: ChatSettings;
}

export async function getChat(
	context: AppLoadContext,
	userId: string,
	chatId: string,
): Promise<Chat | null> {
	const [user, found] = await Promise.all([
		getUserById(context, userId),
		context.DB.query.chat.findFirst({
			where: and(eq(chat.id, chatId), eq(chat.userId, userId)),
			columns: {
				id: true,
				name: true,
			},
			with: {
				messages: {
					orderBy: asc(chatMessage.createdAt),
					columns: {
						id: true,
						message: true,
						createdAt: true,
						userId: true,
					},
				},
				settings: {
					columns: {
						prompt: true,
						agentId: true,
					},
				},
			},
		}),
	]);
	if (!user || !found) return null;

	return {
		id: found.id,
		name: found.name,
		messages: found.messages.map(({ createdAt, id, message, userId }) => ({
			createdAt,
			id,
			message,
			sender: userId ? user.displayName : "AI",
		})),
		settings: {
			prompt: found.settings?.prompt || "You are a helpful AI assistant.",
			agentId: found.settings?.agentId || undefined,
		},
	};
}

export async function updateChatSettings(
	{ DB }: AppLoadContext,
	userId: string,
	chatId: string,
	{ agentId, prompt }: { agentId?: string; prompt?: string },
) {
	const ownedChat = await DB.query.chat.findFirst({
		where: and(eq(chat.id, chatId), eq(chat.userId, userId)),
		columns: {
			id: true,
		},
	});
	if (!ownedChat) return null;

	const existingSettings = await DB.query.chatSettings.findFirst({
		where: eq(chatSettings.chatId, chatId),
		columns: {
			agentId: true,
			prompt: true,
		},
	});

	if (existingSettings) {
		const updated = await DB.update(chatSettings)
			.set({
				agentId: agentId || null,
				prompt: prompt || null,
			})
			.where(eq(chatSettings.chatId, chatId))
			.returning({
				prompt: chatSettings.prompt,
			});
		const updatedSettings = updated[0];
		return updatedSettings || null;
	}

	const inserted = await DB.insert(chatSettings)
		.values({
			chatId,
			agentId: agentId || null,
			prompt: prompt || null,
		})
		.returning({
			prompt: chatSettings.prompt,
		});
	const insertedSettings = inserted[0];
	return insertedSettings || null;
}

export async function addMessage(
	context: AppLoadContext,
	chatId: string,
	message: string,
	senderId?: string,
): Promise<ChatMessage | null> {
	const [addedMessages, user] = await Promise.all([
		context.DB.insert(chatMessage)
			.values({
				chatId,
				message,
				userId: senderId,
			})
			.returning(),
		senderId ? getUserById(context, senderId) : null,
	]);
	const addedMessage = addedMessages[0];
	if (!addedMessage) return null;

	return {
		createdAt: addedMessage.createdAt,
		id: addedMessage.id,
		message: addedMessage.message,
		sender: user ? user.displayName : "AI",
	};
}

export async function updateMessage(
	context: AppLoadContext,
	messageId: string,
	message: string,
) {
	const updated = await context.DB.update(chatMessage)
		.set({ message })
		.where(eq(chatMessage.id, messageId));
	return updated.success;
}

export async function deleteMessage({ DB }: AppLoadContext, messageId: string) {
	const deleted = await DB.delete(chatMessage).where(
		eq(chatMessage.id, messageId),
	);
	return deleted.success;
}

export async function updateGlobalChatSettings(
	context: AppLoadContext,
	userId: string,
	{ prompt }: { prompt?: string },
) {
	const existingSettings = await context.DB.query.globalChatSettings.findFirst({
		where: eq(globalChatSettings.userId, userId),
		columns: {
			prompt: true,
		},
	});

	if (existingSettings) {
		const updated = await context.DB.update(globalChatSettings)
			.set({ prompt: prompt || null })
			.where(eq(globalChatSettings.userId, userId))
			.returning({
				prompt: globalChatSettings.prompt,
			});
		const updatedSettings = updated[0];
		return updatedSettings || null;
	}

	const inserted = await context.DB.insert(globalChatSettings)
		.values({
			userId,
			prompt: prompt || null,
		})
		.returning({
			prompt: globalChatSettings.prompt,
		});
	const insertedSettings = inserted[0];
	return insertedSettings || null;
}

export async function getGlobalChatSettings(
	{ DB }: AppLoadContext,
	userId: string,
) {
	const settings = await DB.select({ prompt: globalChatSettings.prompt })
		.from(globalChatSettings)
		.where(eq(globalChatSettings.userId, userId));
	const result = settings[0];
	return result || null;
}
