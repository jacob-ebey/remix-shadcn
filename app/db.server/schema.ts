import { relations, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
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
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
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
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
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
	chatId: text("chat_id")
		.notNull()
		.references(() => chat.id, { onDelete: "cascade" }),
	userId: text("user_id").references(() => user.id),
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

export const globalChatSettings = sqliteTable("global_chat_settings", {
	id: stringId("id"),
	prompt: text("prompt"),
	userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
});

export const chatSettings = sqliteTable("chat_settings", {
	id: stringId("id"),
	agentId: text("agent_id").references(() => agent.id, {
		onDelete: "set null",
	}),
	chatId: text("chat_id")
		.notNull()
		.references(() => chat.id, { onDelete: "cascade" }),
	prompt: text("prompt"),
});

export const agent = sqliteTable("agent", {
	id: stringId("id"),
	name: text("name").notNull(),
	visibility: text("visibility", { enum: ["private", "public"] }).default(
		"private",
	),
	createdAt: createdAt(),
	createdBy: text("userId")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

const agentRelations = relations(agent, ({ many, one }) => ({
	steps: many(agentStep),
	createdBy: one(user),
}));

export const agentStep = sqliteTable("agent_step", {
	id: stringId("id"),
	name: text("name").notNull(),
	includeChatHistory: integer("include_chat_history", {
		mode: "boolean",
	}).default(false),
	onlyIfPreviousMessages: integer("only_if_previous_messages", {
		mode: "boolean",
	}).default(false),
	systemTemplate: text("system_template").notNull(),
	messageTemplate: text("message_template").notNull(),
	order: integer("order").notNull(),
	agentId: text("agent_id")
		.notNull()
		.references(() => agent.id, { onDelete: "cascade" }),
});

const agentStepRelations = relations(agentStep, ({ one, many }) => ({
	agent: one(agent, {
		fields: [agentStep.agentId],
		references: [agent.id],
	}),
	conditions: many(agentStepCondition),
	messages: many(agentStepMessage),
}));

export const agentStepMessage = sqliteTable("agent_step_message", {
	id: stringId("id"),
	from: text("from", { enum: ["ai", "human"] }).notNull(),
	content: text("message").notNull(),
	order: integer("order").notNull(),
	agentStepId: text("agent_step_id")
		.notNull()
		.references(() => agentStep.id, { onDelete: "cascade" }),
});

const agentStepMessageRelations = relations(agentStepMessage, ({ one }) => ({
	agentStep: one(agentStep, {
		fields: [agentStepMessage.agentStepId],
		references: [agentStep.id],
	}),
}));

export const agentStepCondition = sqliteTable("agent_step_condition", {
	id: stringId("id"),
	variable: text("variable"),
	regex: text("regex"),
	agentStepId: text("agent_step_id")
		.notNull()
		.references(() => agentStep.id, { onDelete: "cascade" }),
});

const agentStepConditionRelations = relations(
	agentStepCondition,
	({ one }) => ({
		agentStep: one(agentStep, {
			fields: [agentStepCondition.agentStepId],
			references: [agentStep.id],
		}),
	}),
);

const schema = {
	agent,
	agentRelations,
	agentStep,
	agentStepRelations,
	agentStepCondition,
	agentStepConditionRelations,
	agentStepMessage,
	agentStepMessageRelations,
	chat,
	chatMessage,
	chatMessageRelations,
	chatRelations,
	chatSettings,
	globalChatSettings,
	password,
	user,
};

export default schema;

export type DB = DrizzleD1Database<typeof schema>;
