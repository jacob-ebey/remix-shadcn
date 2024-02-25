CREATE TABLE `global_chat_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`prompt` text,
	`userId` text,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
