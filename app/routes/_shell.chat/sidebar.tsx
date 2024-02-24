import { ChatBubbleIcon, GearIcon } from "@radix-ui/react-icons";
import { useParams } from "@remix-run/react";
import { ListBox, ListBoxItem } from "react-aria-components";

import { Button } from "@/components/ui/button";
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
			className="relative group @container flex flex-col h-full p-0 @[110px]:p-4 max-w-[70vw] md:max-w-[30vw] data-[collapsed=true]:w-0"
		>
			<div className="sr-only flex @[110px]:not-sr-only justify-between @[110px]:p-2 items-center group-[[data-collapsed=true]]:hidden">
				<div className="flex gap-2 items-center text-2xl">
					<p className="font-medium">Chats</p>
					<span className="text-foreground">({chats.length})</span>
				</div>
			</div>
			<nav className="overflow-y-auto flex-1 py-2 @[110px]:p-0  group-[[data-collapsed=true]]:hidden">
				<ListBox
					selectionMode="single"
					className="grid gap-1 justify-center @[110px]:justify-start"
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
							className="justify-center @[110px]:justify-start gap-4 py-2 flex h-auto min-w-0 w-full px-2 @[110px]:px-8 @[110px]:rounded-none"
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
								<ChatBubbleIcon className="min-w-6 min-h-6 w-6 h-6" />
								<div className="flex-1 flex sr-only flex-col min-w-0 @[110px]:not-sr-only">
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
			<nav className="overflow-y-auto py-2 border-t border-border group-[[data-collapsed=true]]:hidden">
				<ListBox
					selectionMode="single"
					className="grid gap-1 justify-center @[110px]:justify-start"
					aria-label="Admin"
					selectedKeys={chatId ? [chatId] : []}
				>
					<Button
						size="lg"
						variant="ghost"
						asChild
						className="justify-center @[110px]:justify-start gap-4 py-2 flex h-auto min-w-0 w-full px-2 @[110px]:px-8 @[110px]:rounded-none"
					>
						<ListBoxItem href="/chats/settings" textValue="Settings">
							<GearIcon
								className="min-w-6 min-h-6 w-6 h-6"
								width={6}
								height={6}
							/>
							<div className="flex-1 flex sr-only flex-col min-w-0 @[110px]:not-sr-only">
								<span className="truncate">Settings</span>
							</div>
						</ListBoxItem>
					</Button>
				</ListBox>
			</nav>
		</div>
	);
}
