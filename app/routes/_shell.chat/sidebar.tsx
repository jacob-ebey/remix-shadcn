import { ChatBubbleIcon, TrashIcon } from "@radix-ui/react-icons";
import { Form, useParams } from "@remix-run/react";
import { ListBox, ListBoxItem } from "react-aria-components";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChatSummary } from "@/lib/chats.server";
import { Intents } from "@/intents";

interface SidebarProps {
	chats: ChatSummary[];
	isCollapsed: boolean;
}

export function Sidebar({ chats, isCollapsed }: SidebarProps) {
	const { chatId } = useParams();

	return (
		<div
			data-collapsed={isCollapsed}
			className="relative group @container flex flex-col h-full p-0 @[120px]:p-4 max-w-[90vw] md:max-w-[30vw] group-[[data-collapsed=true]]:hidden md:group-[[data-collapsed=true]]:flex"
		>
			<Form id="clear-chats-form" method="POST">
				<input type="hidden" name="intent" value={Intents.ClearChats} />
			</Form>
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
				<div className="flex flex-col gap-1 justify-center @[120px]:justify-start">
					<Button
						type="submit"
						form="clear-chats-form"
						size="lg"
						variant="ghost"
						className="justify-center @[120px]:justify-start gap-4 py-2 div h-auto min-w-0 w-full px-2 @[120px]:px-4 rounded-none"
					>
						<TrashIcon
							className="min-w-4 min-h-6 w-6 h-6"
							width={6}
							height={6}
						/>
						<div className="flex sr-only flex-col min-w-0 @[120px]:not-sr-only">
							<span className="truncate">Clear Chats</span>
						</div>
					</Button>
				</div>
			</nav>
		</div>
	);
}
