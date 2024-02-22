import { GearIcon, PaperPlaneIcon, Pencil1Icon } from "@radix-ui/react-icons";
import { Form, Link } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import * as React from "react";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
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
import { cn } from "@/lib/styles";

import { Intents } from "./form";

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

// biome-ignore lint/suspicious/noExplicitAny: TODO: add links
const topLinks: { Icon: any; id: string }[] = []; // [{ icon: Phone }, { icon: Video }, { icon: Info }];

export function ChatTopBar({
	chatId,
	chatName,
}: { chatId: string | undefined; chatName: string | undefined }) {
	return (
		<div className="w-full h-20 flex p-4 justify-between items-center border-b">
			<div className="flex flex-1 items-center gap-2 overflow-hidden min-w-0">
				{chatId && (
					<Avatar className="flex justify-center items-center">
						<AvatarImage
							src={`https://random-image-pepebigotes.vercel.app/api/random-image?chat=${chatId}`}
							alt=""
							width={6}
							height={6}
							className="w-10 h-10 "
						/>
					</Avatar>
				)}
				<div className="flex-1">
					<div className="font-medium whitespace-nowrap">
						{chatId ? chatName : "New Chat"}
					</div>
					{/* <span className="text-xs whitespace-nowrap">Active 2 mins ago</span> */}
				</div>
			</div>

			<div className="flex gap-2">
				<Dialog>
					<DialogTrigger asChild>
						<Button type="button" size="icon" variant="ghost">
							<span className="sr-only">Chat settings</span>
							<GearIcon />
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>Chat settings</DialogTitle>
							<DialogDescription>
								Make changes that apply to only this chat.
							</DialogDescription>
						</DialogHeader>
						<div>
							<div className="space-y-2">
								<Label htmlFor="username">Prompt</Label>
								<Textarea id="username" defaultValue="" />
							</div>
						</div>
						<DialogFooter>
							<Button type="submit">Save changes</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				<Button asChild size="icon" variant="ghost">
					<Link to="/chat" className="h-9 w-9">
						<Pencil1Icon />
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
				layout
				initial={{ opacity: 0, scale: 1, y: 50, x: 0 }}
				animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
				exit={{ opacity: 0, scale: 1, y: 1, x: 0 }}
				transition={{
					opacity: { duration: 0.1 },
					layout: {
						type: "spring",
						bounce: 0.3,
						duration: i * 0.05 + 0.2,
					},
				}}
				style={{
					originX: 0.5,
					originY: 0.5,
				}}
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
			<div className="flex gap-3 items-center">
				{position === "left" && (
					<Avatar className="flex justify-center items-center">
						<AvatarImage src={avatar} alt={sender} width={6} height={6} />
					</Avatar>
				)}
				<span
					className={cn("p-3 rounded-md max-w-xs", {
						"bg-accent text-accent-foreground": position === "right",
						"bg-secondary text-secondary-foreground": position === "left",
					})}
				>
					{children}
				</span>
				{position === "right" && (
					<Avatar className="flex justify-center items-center">
						<AvatarImage src={avatar} alt={sender} width={6} height={6} />
					</Avatar>
				)}
			</div>
		</div>
	);
}

export function ChatBottomBar({ chatId }: { chatId: string | undefined }) {
	const autoHeightTextArea = useAutoHeightTextArea();

	const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === "Enter" && event.shiftKey) {
			event.currentTarget.value = `${event.currentTarget.value}\n`;
			event.preventDefault();
			return;
		}

		if (event.key === "Enter" && !event.shiftKey) {
			const message = event.currentTarget.value;
			const textArea = autoHeightTextArea.ref.current;
			setTimeout(() => {
				if (textArea && message.trim()) {
					textArea.value = "";

					if (autoHeightTextArea.ref.current) {
						autoHeightTextArea.ref.current.focus();
					}
				}
			}, 1);

			event.currentTarget.form?.requestSubmit();
			event.preventDefault();
			return;
		}
	};

	return (
		<Form
			method="POST"
			className="p-2 flex justify-between w-full items-center gap-2"
		>
			<input type="hidden" name="intent" value={Intents.SendMessage} />

			<div className="w-full relative">
				<Textarea
					{...autoHeightTextArea}
					key={chatId}
					autoFocus={!!chatId}
					autoComplete="off"
					onKeyDown={handleKeyPress}
					name="message"
					placeholder="Aa"
					className=" w-full border flex items-center h-9 resize-none overflow-hidden bg-background"
				/>
			</div>

			<Button type="submit" variant="ghost" size="icon" className="h-9 w-9">
				<PaperPlaneIcon className="text-muted-foreground" />
			</Button>
		</Form>
	);
}
