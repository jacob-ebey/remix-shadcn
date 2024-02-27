import { getFormProps, getTextareaProps } from "@conform-to/react";
import {
	GearIcon,
	MagicWandIcon,
	PaperPlaneIcon,
	PersonIcon,
} from "@radix-ui/react-icons";
import {
	useActionData,
	useFetcher,
	useLocation,
	useNavigate,
	useNavigation,
} from "@remix-run/react";
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
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea, useAutoHeightTextArea } from "@/components/ui/textarea";
import { useChatSettingsForm, useSendMessageForm } from "@/forms/chat";
import { Intents } from "@/intents";
import { cn } from "@/lib/styles";
import type { RecursivePromise } from "@/routes/api.chat.($chatId)/client";

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
	agents,
	chatId,
	chatName,
	selectedAgentId,
	systemPrompt,
}: {
	agents: { id: string; name: string }[];
	chatId: string | undefined;
	chatName: string | undefined;
	selectedAgentId: string | undefined;
	systemPrompt: string | null;
}) {
	const autoHeightTextArea = useAutoHeightTextArea();
	const actionData = useActionData<typeof clientAction>();
	const navigate = useNavigate();
	const realLocation = useLocation();
	const navigation = useNavigation();
	const location = navigation.location?.pathname.match(/\/chat\/?/)
		? navigation.location
		: realLocation;
	const saveSettingsFetcher = useFetcher({
		key: `updated-chat-settings-${chatId || ""}`,
	});

	const savingSettings =
		saveSettingsFetcher.state !== "idle" &&
		saveSettingsFetcher.formData?.get("intent") === Intents.UpdateChatSettings;

	const [updateChatSettingsForm, updateChatSettingsFields] =
		useChatSettingsForm(actionData?.[Intents.UpdateChatSettings]?.lastResult, {
			chatId,
			disabled: savingSettings,
		});

	return (
		<div className="w-full flex py-2 gap-4 px-4 md:p-4 justify-between items-center border-b">
			<div className="flex flex-1 items-center gap-2 overflow-hidden min-w-0">
				{chatId && <MagicWandIcon className="h-4 w-4" />}
				<div className="flex-1 min-w-0">
					<div className="font-medium whitespace-nowrap truncate">
						{chatId ? chatName : "New chat"}
					</div>
					{/* <span className="text-xs whitespace-nowrap">Active 2 mins ago</span> */}
				</div>
			</div>

			{(!chatId || selectedAgentId) && agents.length > 0 && (
				<Select
					key={selectedAgentId}
					name={updateChatSettingsFields.agentId.name}
					defaultValue={selectedAgentId || " "}
					disabled={!!chatId}
					onValueChange={(value) => {
						const newAgent = value.trim();
						if (location.pathname.match(/\/chat\/?/)) {
							const search = new URLSearchParams(location.search);
							if (newAgent) search.set("agent", value);
							else search.delete("agent");
							const newSearch = search.toString();
							navigate(
								`${location.pathname}${newSearch ? `?${newSearch}` : ""}`,
							);
						} else {
							throw new Error("Can't change agent for existing chat.");
						}
					}}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Select an agent" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							{[{ id: " ", name: "None" }, ...agents].map((agent) => (
								<SelectItem key={agent.id} value={agent.id}>
									{agent.name}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
			)}

			{!selectedAgentId && (
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
										key={updateChatSettingsFields.prompt.key}
										defaultValue={systemPrompt || ""}
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
				</div>
			)}
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
	agentId,
	chatId,
	prompt,
}: {
	agentId: string | null | undefined;
	chatId: string | undefined;
	prompt: string | null | undefined;
}) {
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
				name={sendMessageFields.prompt.name}
				value={prompt || ""}
			/>
			<input
				type="hidden"
				name={sendMessageFields.agent.name}
				value={agentId || ""}
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
