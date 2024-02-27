CREATE TABLE `agent` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`visibility` text DEFAULT 'private',
	`created_at` text NOT NULL,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `agent_step` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`include_chat_history` integer DEFAULT false,
	`only_if_previous_messages` integer DEFAULT false,
	`system_template` text NOT NULL,
	`message_template` text NOT NULL,
	`order` integer NOT NULL,
	`agent_id` text NOT NULL,
	FOREIGN KEY (`agent_id`) REFERENCES `agent`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `agent_step_condition` (
	`id` text PRIMARY KEY NOT NULL,
	`variable` text,
	`regex` text,
	`agent_step_id` text NOT NULL,
	FOREIGN KEY (`agent_step_id`) REFERENCES `agent_step`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `agent_step_message` (
	`id` text PRIMARY KEY NOT NULL,
	`from` text NOT NULL,
	`message` text NOT NULL,
	`order` integer NOT NULL,
	`agent_step_id` text NOT NULL,
	FOREIGN KEY (`agent_step_id`) REFERENCES `agent_step`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `chat` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` text NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `chat_message` (
	`id` text PRIMARY KEY NOT NULL,
	`message` text NOT NULL,
	`created_at` text NOT NULL,
	`chat_id` text NOT NULL,
	`user_id` text,
	FOREIGN KEY (`chat_id`) REFERENCES `chat`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `chat_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`agent_id` text,
	`chat_id` text NOT NULL,
	`prompt` text,
	FOREIGN KEY (`agent_id`) REFERENCES `agent`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`chat_id`) REFERENCES `chat`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `global_chat_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`prompt` text,
	`user_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `password` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`password` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`full_name` text NOT NULL,
	`display_name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);