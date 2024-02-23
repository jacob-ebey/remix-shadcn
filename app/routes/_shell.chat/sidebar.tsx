import { Button, buttonVariants } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useParams } from "@remix-run/react";
import { ListBox, ListBoxItem } from "react-aria-components";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { ChatSummary } from "@/lib/chats.server";
import { cn } from "@/lib/styles";

interface SidebarProps {
	chats: ChatSummary[];
	isCollapsed: boolean;
}

export function Sidebar({ chats, isCollapsed }: SidebarProps) {
	const { chatId } = useParams();

	return (
		<div
			data-collapsed={isCollapsed}
			className="relative group flex flex-col h-full gap-4 px-2 data-[collapsed=true]:p-0"
		>
			{!isCollapsed && (
				<div className="flex justify-between p-2 items-center">
					<div className="flex gap-2 items-center text-2xl">
						<p className="font-medium">Chats</p>
						<span className="text-foreground">({chats.length})</span>
					</div>
				</div>
			)}
			<nav className="overflow-y-auto md:py-2">
				<ListBox
					selectionMode="single"
					className="grid gap-1 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]"
					aria-label="Chats"
					selectedKeys={chatId ? [chatId] : []}
					key={chats.length}
				>
					{chats.map((chat) =>
						isCollapsed ? (
							<ListBoxItem
								key={chat.id}
								className={cn(
									buttonVariants({
										size: "icon",
										variant: "ghost",
									}),
									"w-14 h-14",
								)}
								id={chat.id}
								href={`/chat/${chat.id}`}
								textValue={`From: ${chat.name}.${
									chat.lastMessage
										? `Last message: ${chat.lastMessage}`
										: "No messages"
								}`}
							>
								<TooltipProvider>
									<Tooltip delayDuration={0}>
										<TooltipTrigger asChild>
											<Avatar className="flex justify-center items-center">
												<AvatarImage
													src={`https://random-image-pepebigotes.vercel.app/api/random-image?chat=${chat.id}`}
													alt=""
													width={6}
													height={6}
													className="w-10 h-10"
												/>
											</Avatar>
										</TooltipTrigger>
										<TooltipContent
											side="right"
											className="flex items-center gap-4"
										>
											{chat.name}
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>

								<span className="sr-only">{chat.name}</span>
							</ListBoxItem>
						) : (
							<Button
								key={chat.id}
								size="lg"
								variant="ghost"
								asChild
								className="justify-start gap-4 py-2 flex h-auto min-w-0 w-full"
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
									<Avatar className="flex justify-center items-center">
										<AvatarImage
											src={`https://random-image-pepebigotes.vercel.app/api/random-image?chat=${chat.id}`}
											alt=""
											width={6}
											height={6}
											className="w-10 h-10 "
										/>
									</Avatar>
									<div className="flex-1 flex flex-col min-w-0">
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
						),
					)}
				</ListBox>
			</nav>
		</div>
	);
}
