import { ChatBubbleIcon, PersonIcon, TrashIcon } from "@radix-ui/react-icons";
import { Form, Link, useParams } from "@remix-run/react";
import { ListBox, ListBoxItem } from "react-aria-components";

import {
	ConfirmationContent,
	useConfirmationDialog,
} from "@/components/confirmation-dialog";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Intents } from "@/forms";
import type { ChatSummary } from "@/lib/chats.server";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

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
			className="relative group @container flex flex-col h-full p-0 @[120px]:p-4 max-w-[90vw] md:max-w-[30vw] group-[[data-collapsed=true]]:hidden md:group-[[data-collapsed=true]]:flex"
		>
			<div className="sr-only flex @[120px]:not-sr-only justify-between @[120px]:p-4 items-center border-b border-border">
				<div className="flex gap-2 items-center">
					<p className="font-medium">Chats</p>
					<span className="text-foreground">({chats.length})</span>
				</div>
			</div>
			<nav className="overflow-y-auto flex-1 py-2 @[120px]:p-0">
				<ListBox
					selectionMode="single"
					className="flex flex-col gap-1 justify-center @[120px]:justify-start"
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
							className="justify-center @[120px]:justify-start gap-4 py-2 flex h-auto min-w-0 w-full px-2 @[120px]:px-4 rounded-none"
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
								<div className="flex-1 flex sr-only flex-col min-w-0 @[120px]:not-sr-only">
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
			<nav className="overflow-y-auto py-2 border-t border-border">
				<Form id="clear-chats-form" method="POST" className="hidden" />
				<div className="flex flex-col gap-1 justify-center @[120px]:justify-start">
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
									className="justify-center @[120px]:justify-start gap-4 py-2 div h-auto min-w-0 w-full px-2 @[120px]:px-4 rounded-none"
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
									<div className="flex sr-only flex-col min-w-0 @[120px]:not-sr-only">
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
						className="justify-center @[120px]:justify-start gap-4 py-2 div h-auto min-w-0 w-full px-2 @[120px]:px-4 rounded-none"
					>
						<Link to="/account">
							<PersonIcon
								className="min-w-4 min-h-6 w-6 h-6"
								width={6}
								height={6}
							/>
							<div className="flex sr-only flex-col min-w-0 @[120px]:not-sr-only">
								<span className="truncate">Account settings</span>
							</div>
						</Link>
					</Button>
				</div>
			</nav>
		</div>
	);
}
