import { ChatBubbleIcon, GearIcon } from "@radix-ui/react-icons";
import { useParams } from "@remix-run/react";
import { ListBox, ListBoxItem } from "react-aria-components";
import { createPortal } from "react-dom";
import { useHydrated } from "remix-utils/use-hydrated";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChatSummary } from "@/lib/chats.server";

interface SidebarProps {
	chats: ChatSummary[];
	isCollapsed: boolean;
}

export function Sidebar({ chats, isCollapsed }: SidebarProps) {
	const { chatId } = useParams();

	return (
		<div
			data-collapsed={isCollapsed}
			className="relative group @container flex flex-col h-full p-0 @[120px]:p-4 min-w-[9vw] max-w-[90vw] md:max-w-[30vw] group-[[data-collapsed=true]]:hidden md:group-[[data-collapsed=true]]:flex"
		>
			<div className="sr-only flex @[120px]:not-sr-only justify-between @[120px]:p-2 items-center">
				<div className="flex gap-2 items-center text-2xl">
					<p className="font-medium">Chats</p>
					<span className="text-foreground">({chats.length})</span>
				</div>
			</div>
			<nav className="overflow-y-auto flex-1 py-2 @[120px]:p-0">
				<ListBox
					selectionMode="single"
					className="grid gap-1 justify-center @[120px]:justify-start"
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
							className="justify-center @[120px]:justify-start gap-4 px-2 py-2 flex h-auto min-w-0 w-full @[120px]:px-8 @[120px]:rounded-none"
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
											<ChatBubbleIcon className="min-w-6 min-h-6 w-6 h-6" />
										</TooltipTrigger>
										<TooltipContent side="right">{chat.name}</TooltipContent>
									</Tooltip>
								) : (
									<ChatBubbleIcon className="min-w-6 min-h-6 w-6 h-6" />
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
				<ListBox
					selectionMode="single"
					className="grid gap-1 justify-center @[120px]:justify-start"
					aria-label="Admin"
					selectedKeys={chatId ? [chatId] : []}
				>
					<Button
						size="lg"
						variant="ghost"
						asChild
						className="justify-center @[120px]:justify-start gap-4 py-2 flex h-auto min-w-0 w-full px-2 @[120px]:px-8 @[120px]:rounded-none"
					>
						<ListBoxItem href="/chats/settings" textValue="Settings">
							<GearIcon
								className="min-w-6 min-h-6 w-6 h-6"
								width={6}
								height={6}
							/>
							<div className="flex-1 flex sr-only flex-col min-w-0 @[120px]:not-sr-only">
								<span className="truncate">Settings</span>
							</div>
						</ListBoxItem>
					</Button>
				</ListBox>
			</nav>
		</div>
	);
}
