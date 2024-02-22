import { relations, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { v4 as uuid } from "uuid";

const stringId = (name: string) =>
	text(name)
		.primaryKey()
		.notNull()
		.$defaultFn(() => uuid());

const createdAt = () =>
	text("created_at")
		.notNull()
		.$default(() => sql`CURRENT_TIMESTAMP`);

export const password = sqliteTable("password", {
	id: stringId("id"),
	userId: text("userId")
		.notNull()
		.references(() => user.id),
	password: text("password").notNull(),
	createdAt: createdAt(),
});

export const user = sqliteTable("user", {
	id: stringId("id"),
	email: text("email").unique().notNull(),
	fullName: text("full_name").notNull(),
	displayName: text("display_name").notNull(),
});

export const chat = sqliteTable("chat", {
	id: stringId("id"),
	name: text("name").notNull(),
	createdAt: createdAt(),
	userId: text("userId")
		.notNull()
		.references(() => user.id),
});

const chatRelations = relations(chat, ({ many, one }) => ({
	messages: many(chatMessage),
	settings: one(chatSettings, {
		fields: [chat.id],
		references: [chatSettings.chatId],
	}),
}));

export const chatMessage = sqliteTable("chat_message", {
	id: stringId("id"),
	message: text("message").notNull(),
	createdAt: createdAt(),
	chatId: text("chatId")
		.notNull()
		.references(() => chat.id),
	userId: text("userId").references(() => user.id),
});

export const chatSettings = sqliteTable("chat_settings", {
	id: stringId("id"),
	chatId: text("chatId")
		.notNull()
		.references(() => chat.id),
	prompt: text("prompt"),
});

const chatMessageRelations = relations(chatMessage, ({ one }) => ({
	chat: one(chat, {
		fields: [chatMessage.chatId],
		references: [chat.id],
	}),
	sender: one(user, {
		fields: [chatMessage.userId],
		references: [user.id],
	}),
}));
const schema = {
	chat,
	chatMessage,
	chatMessageRelations,
	chatRelations,
	chatSettings,
	password,
	user,
};

export default schema;

export type DB = DrizzleD1Database<typeof schema>;
