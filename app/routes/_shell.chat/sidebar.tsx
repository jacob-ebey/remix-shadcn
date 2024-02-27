import {
	ChatBubbleIcon,
	GearIcon,
	Pencil1Icon,
	PersonIcon,
	TrashIcon,
} from "@radix-ui/react-icons";
import { Form, Link, useParams } from "@remix-run/react";
import { ListBox, ListBoxItem } from "react-aria-components";

import {
	ConfirmationContent,
	useConfirmationDialog,
} from "@/components/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Intents } from "@/intents";
import type { ChatSummary } from "@/lib/chats.server";

interface SidebarProps {
	chats: ChatSummary[];
	isCollapsed: boolean;
}

export function Sidebar({ chats, isCollapsed }: SidebarProps) {
	const { chatId } = useParams();

	const confirmation = useConfirmationDialog();

	return (
		<div
			data-collapsed={isCollapsed}
			className="relative group @container flex flex-col h-full p-0 @[150px]:p-4 max-w-[90vw] md:max-w-[30vw] group-[[data-collapsed=true]]:hidden md:group-[[data-collapsed=true]]:flex"
		>
			<div className="justify-center @[150px]:justify-start gap-4 flex h-auto min-w-0 w-full py-2 px-4 md:p-4 rounded-none border-b border-border">
				<div className="flex gap-2 items-center sr-only @[150px]:not-sr-only flex-1">
					<p className="font-medium">Chats</p>
					<span className="text-foreground">({chats.length})</span>
				</div>
				<div className="flex gap-2 items-center py-2 @[150px]:p-0 ">
					<Tooltip delayDuration={0}>
						<TooltipTrigger asChild>
							{/* TODO: This should not be an icon when collapsed / small */}
							<Button asChild size="icon" variant="ghost">
								<Link to="/chat">
									<Pencil1Icon className="w-6 h-6 min-w-6 min-h-6" />
								</Link>
							</Button>
						</TooltipTrigger>
						<TooltipContent side={isCollapsed ? "right" : "top"}>
							New chat
						</TooltipContent>
					</Tooltip>
				</div>
			</div>
			<nav className="overflow-y-auto flex-1 py-2 @[150px]:p-0 @[150px]:py-0.5">
				<ListBox
					selectionMode="single"
					className="flex flex-col gap-1 justify-center @[150px]:justify-start"
					aria-label="Chats"
					selectedKeys={chatId ? [chatId] : []}
					key={chats.length}
				>
					{chats.map((chat) => (
						<Button
							key={chat.id}
							size="lg"
							variant="ghost"
							asChild
							className="justify-center @[150px]:justify-start gap-4 py-2 flex h-auto min-w-0 w-full px-2 @[150px]:px-4 rounded-none"
						>
							<ListBoxItem
								id={chat.id}
								href={`/chat/${chat.id}`}
								textValue={`From: ${chat.name}.${
									chat.lastMessage
										? ` Last message: ${chat.lastMessage}`
										: "No messages"
								}`}
							>
								{isCollapsed ? (
									<Tooltip delayDuration={0}>
										<TooltipTrigger asChild>
											<ChatBubbleIcon className="min-w-4 min-h-6 w-6 h-6" />
										</TooltipTrigger>
										<TooltipContent side="right">{chat.name}</TooltipContent>
									</Tooltip>
								) : (
									<ChatBubbleIcon className="min-w-4 min-h-6 w-6 h-6" />
								)}
								<div className="flex-1 flex sr-only flex-col min-w-0 @[150px]:not-sr-only">
									<span className="truncate">{chat.name}</span>
									{chat.lastMessage && (
										<span className="text-muted-foreground text-xs truncate">
											{chat.lastMessage.sender.split(" ")[0]}:{" "}
											{chat.lastMessage.message}
										</span>
									)}
								</div>
							</ListBoxItem>
						</Button>
					))}
				</ListBox>
			</nav>
			<nav className="overflow-y-auto py-2 border-t border-border @[150px]:py-0.5">
				<Form id="clear-chats-form" method="POST" className="hidden" />
				<div className="flex flex-col gap-1 justify-center @[150px]:justify-start">
					<confirmation.Provider>
						<Dialog
							open={confirmation.open}
							onOpenChange={confirmation.onOpenChange}
						>
							<DialogTrigger asChild>
								<Button
									form="clear-chats-form"
									type="submit"
									name="intent"
									value={Intents.ClearChats}
									size="lg"
									variant="ghost"
									className="justify-center @[150px]:justify-start gap-4 py-2 div h-auto min-w-0 w-full px-2 @[150px]:px-4 rounded-none"
									onClick={(event) => {
										confirmation.setOptions({
											title: "Clear chats?",
											description:
												"Are you sure you want to clear all chats? This action cannot be undone.",
											options: [
												{
													label: "Cancel",
												},
												{
													label: "Yes, clear chats",
													variant: "destructive",
													intent: Intents.ClearChats,
													form: "clear-chats-form",
												},
											],
										});
										event.preventDefault();
									}}
								>
									<TrashIcon
										className="min-w-4 min-h-6 w-6 h-6"
										width={6}
										height={6}
									/>
									<div className="flex sr-only flex-col min-w-0 @[150px]:not-sr-only">
										<span className="truncate">Clear chats</span>
									</div>
								</Button>
							</DialogTrigger>
							<ConfirmationContent />
						</Dialog>
					</confirmation.Provider>
					<Button
						asChild
						size="lg"
						variant="ghost"
						className="justify-center @[150px]:justify-start gap-4 py-2 div h-auto min-w-0 w-full px-2 @[150px]:px-4 rounded-none"
					>
						<Link to="/agents">
							<PersonIcon
								className="min-w-6 min-h-6 w-6 h-6"
								width={6}
								height={6}
							/>
							<div className="flex sr-only flex-col min-w-0 @[150px]:not-sr-only">
								<span className="truncate">AI Agents</span>
							</div>
						</Link>
					</Button>
					<Button
						asChild
						size="lg"
						variant="ghost"
						className="justify-center @[150px]:justify-start gap-4 py-2 div h-auto min-w-0 w-full px-2 @[150px]:px-4 rounded-none"
					>
						<Link to="/settings">
							<GearIcon
								className="min-w-6 min-h-6 w-6 h-6"
								width={6}
								height={6}
							/>
							<div className="flex sr-only flex-col min-w-0 @[150px]:not-sr-only">
								<span className="truncate">Global settings</span>
							</div>
						</Link>
					</Button>
				</div>
			</nav>
		</div>
	);
}
