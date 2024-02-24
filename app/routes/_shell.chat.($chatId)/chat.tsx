import { getFormProps, getTextareaProps } from "@conform-to/react";
import {
	GearIcon,
	MagicWandIcon,
	PaperPlaneIcon,
	Pencil1Icon,
	PersonIcon,
} from "@radix-ui/react-icons";
import { Link, useActionData, useFetcher } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea, useAutoHeightTextArea } from "@/components/ui/textarea";
import { Intents } from "@/intents";
import { cn } from "@/lib/styles";

import { RecursivePromise } from "../api.chat.($chatId)/client";
import { DEFAULT_SYSTEM_PROMPT } from "./ai";
import { useChatSettingsForm, useSendMessageForm } from "./form";
import type { clientAction } from "./route";

export interface Message {
	id: number;
	avatar: string;
	name: string;
	message: string;
}

export interface UserData {
	id: string;
	avatar: string;
	name: string;
}

export function ChatTopBar({
	chatId,
	chatName,
	systemPrompt,
}: {
	chatId: string | undefined;
	chatName: string | undefined;
	systemPrompt: string | undefined;
}) {
	const autoHeightTextArea = useAutoHeightTextArea();
	const actionData = useActionData<typeof clientAction>();
	const saveSettingsFetcher = useFetcher({
		key: `updated-chat-settings-${chatId || ""}`,
	});

	const savingSettings =
		saveSettingsFetcher.state !== "idle" &&
		saveSettingsFetcher.formData?.get("intent") === Intents.UpdateChatSettings;

	const [updateChatSettingsForm, updateChatSettingsFields] =
		useChatSettingsForm(actionData?.[Intents.UpdateChatSettings]?.lastResult, {
			disabled: savingSettings,
		});

	return (
		<div className="w-full flex py-2 px-4 md:p-4 justify-between items-center border-b">
			<div className="flex flex-1 items-center gap-2 overflow-hidden min-w-0">
				{chatId && <MagicWandIcon className="h-4 w-4" />}
				<div className="flex-1 min-w-0">
					<div className="font-medium whitespace-nowrap truncate">
						{chatId ? chatName : "New chat"}
					</div>
					{/* <span className="text-xs whitespace-nowrap">Active 2 mins ago</span> */}
				</div>
			</div>

			<div className="flex gap-2">
				<Dialog>
					<DialogTrigger asChild>
						<Button type="button" size="icon" variant="ghost">
							<span className="sr-only">Chat settings</span>
							<GearIcon className="w-6 h-6" />
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>Chat settings</DialogTitle>
							<DialogDescription>
								Make changes that apply to only this chat.
							</DialogDescription>
						</DialogHeader>
						<saveSettingsFetcher.Form
							{...getFormProps(updateChatSettingsForm)}
							method="POST"
						>
							<input
								type="hidden"
								name="intent"
								value={Intents.UpdateChatSettings}
							/>
							<div className="space-y-2">
								<Label htmlFor={updateChatSettingsFields.prompt.id}>
									System Prompt
								</Label>
								<Textarea
									{...getTextareaProps(updateChatSettingsFields.prompt)}
									{...autoHeightTextArea}
									defaultValue={systemPrompt}
								/>
								<div
									id={updateChatSettingsFields.prompt.descriptionId}
									className="text-sm text-destructive"
								>
									{updateChatSettingsFields.prompt.errors ||
										updateChatSettingsFields.global.errors}
								</div>
							</div>
						</saveSettingsFetcher.Form>
						<DialogFooter>
							<Button
								form={updateChatSettingsForm.id}
								type="submit"
								disabled={savingSettings}
							>
								Save changes
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				<Button asChild size="icon" variant="ghost">
					<Link to="/chat">
						<Pencil1Icon className="w-6 h-6" />
					</Link>
				</Button>
			</div>
		</div>
	);
}

export function AnimatedMessages({ children }: { children: React.ReactNode }) {
	return React.Children.toArray(children).map((child, i) => (
		// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
		<AnimatePresence key={i}>
			<motion.div
				layoutScroll
				initial={{ opacity: 0, y: 100 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, transition: { duration: 0.15 } }}
			>
				{child}
			</motion.div>
		</AnimatePresence>
	));
}

export function ChatMessage({
	avatar,
	children,
	position,
	sender,
}: {
	avatar: string;
	children: React.ReactNode;
	position: "left" | "right";
	sender: string;
}) {
	return (
		<div
			className={cn(
				"flex flex-col gap-2 p-4 whitespace-pre-wrap",
				position === "right" ? "items-end" : "items-start",
			)}
		>
			<div className="flex gap-3 items-end">
				{position === "left" && <MagicWandIcon className="w-6 h-6 min-w-4" />}
				<span
					className={cn("p-3 rounded-md max-w-xs", {
						"bg-accent text-accent-foreground": position === "right",
						"bg-secondary text-secondary-foreground": position === "left",
					})}
				>
					{children}
				</span>
				{position === "right" && (
					<PersonIcon width={6} height={6} className="w-6 h-6 min-w-4" />
				)}
			</div>
		</div>
	);
}

export function ChatBottomBar({
	chatId,
	prompt,
}: { chatId: string | undefined; prompt: string | undefined }) {
	const actionData = useActionData<typeof clientAction>();
	const fetcher = useFetcher({ key: "send-message" });

	const autoHeightTextArea = useAutoHeightTextArea();
	const [sendMessageForm, sendMessageFields] = useSendMessageForm(
		actionData?.[Intents.SendMessage]?.lastResult,
		{ disabled: fetcher.state === "submitting" },
	);

	const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === "Enter" && event.shiftKey) {
			event.currentTarget.value = `${event.currentTarget.value}\n`;
			event.preventDefault();
			return;
		}

		if (event.key === "Enter" && !event.shiftKey) {
			event.currentTarget.form?.requestSubmit();
			event.preventDefault();
			return;
		}
	};

	return (
		<fetcher.Form
			{...getFormProps(sendMessageForm)}
			method="POST"
			className="p-2 flex justify-between w-full items-center gap-2"
		>
			<input type="hidden" name="intent" value={Intents.SendMessage} />
			<input
				type="hidden"
				name="prompt"
				value={prompt !== DEFAULT_SYSTEM_PROMPT ? prompt : ""}
			/>

			<div className="w-full relative space-y-2">
				<Textarea
					{...getTextareaProps(sendMessageFields.message)}
					{...autoHeightTextArea}
					key={chatId}
					autoComplete="off"
					onKeyDown={handleKeyPress}
					name="message"
					placeholder="Enter a message..."
					className=" w-full border flex items-center h-9 resize-none overflow-hidden bg-background"
				/>
				<div
					id={sendMessageFields.message.descriptionId}
					className="text-sm text-destructive"
				>
					{sendMessageFields.message.errors || sendMessageFields.global.errors}
				</div>
			</div>

			<Button type="submit" variant="ghost" size="icon" className="h-4 w-4">
				<PaperPlaneIcon className="text-muted-foreground" />
			</Button>
		</fetcher.Form>
	);
}

export function StreamingBotMessage({
	avatar,
	next,
}: {
	avatar: string;
	next: Promise<RecursivePromise>;
}) {
	return (
		<ChatMessage avatar={avatar} position="left" sender="AI">
			<React.Suspense fallback="...">
				<StreamingText next={next} />
			</React.Suspense>
		</ChatMessage>
	);
}

export function StreamingText({ next }: { next: Promise<RecursivePromise> }) {
	const { next: nextNext, value } = React.use(next);

	React.useEffect(() => {
		const messages = document.getElementById("messages");
		if (messages) {
			messages.scrollTop = messages.scrollHeight;
		}
	}, []);

	return (
		<>
			{value || ""}
			{nextNext && (
				<React.Suspense fallback="...">
					<StreamingText next={nextNext} />
				</React.Suspense>
			)}
		</>
	);
}
