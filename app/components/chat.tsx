import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "framer-motion";
import * as React from "react";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/styles";
import { Link } from "@remix-run/react";

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

interface ChatTopBarProps {
	selectedUser: UserData;
}

// biome-ignore lint/suspicious/noExplicitAny: TODO: add links
const topLinks: { Icon: any; id: string }[] = []; // [{ icon: Phone }, { icon: Video }, { icon: Info }];

export function ChatTopBar({ selectedUser }: ChatTopBarProps) {
	return (
		<div className="w-full h-20 flex p-4 justify-between items-center border-b">
			<div className="flex items-center gap-2">
				<Avatar className="flex justify-center items-center">
					<AvatarImage
						src={selectedUser.avatar}
						alt={selectedUser.name}
						width={6}
						height={6}
						className="w-10 h-10 "
					/>
				</Avatar>
				<div className="flex flex-col">
					<span className="font-medium">{selectedUser.name}</span>
					<span className="text-xs">Active 2 mins ago</span>
				</div>
			</div>

			<div>
				{topLinks.map((icon, index) => (
					<Button size="icon" variant="ghost" key={icon.id}>
						<Link to="#" className="h-9 w-9">
							<icon.Icon className="text-muted-foreground" />
						</Link>
					</Button>
				))}
			</div>
		</div>
	);
}

interface ChatListProps {
	messages?: Message[];
	selectedUser: {
		id: string;
		avatar: string;
		name: string;
	};
	isMobile: boolean;
	loggedInUserData: UserData;
}

export function ChatList({
	messages,
	selectedUser,
	isMobile,
	loggedInUserData,
}: ChatListProps) {
	const messagesContainerRef = React.useRef<HTMLDivElement>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: scroll stuff
	React.useEffect(() => {
		if (messagesContainerRef.current) {
			messagesContainerRef.current.scrollTop =
				messagesContainerRef.current.scrollHeight;
		}
	}, [messages]);

	return (
		<div className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col">
			<div
				ref={messagesContainerRef}
				className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col"
			>
				<AnimatePresence>
					{messages?.map((message, index) => (
						<motion.div
							key={message.id}
							layout
							initial={{ opacity: 0, scale: 1, y: 50, x: 0 }}
							animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
							exit={{ opacity: 0, scale: 1, y: 1, x: 0 }}
							transition={{
								opacity: { duration: 0.1 },
								layout: {
									type: "spring",
									bounce: 0.3,
									duration: messages.indexOf(message) * 0.05 + 0.2,
								},
							}}
							style={{
								originX: 0.5,
								originY: 0.5,
							}}
							className={cn(
								"flex flex-col gap-2 p-4 whitespace-pre-wrap",
								message.name !== selectedUser.name
									? "items-end"
									: "items-start",
							)}
						>
							<div className="flex gap-3 items-center">
								{message.name === selectedUser.name && (
									<Avatar className="flex justify-center items-center">
										<AvatarImage
											src={message.avatar}
											alt={message.name}
											width={6}
											height={6}
										/>
									</Avatar>
								)}
								<span className=" bg-accent p-3 rounded-md max-w-xs">
									{message.message}
								</span>
								{message.name !== selectedUser.name && (
									<Avatar className="flex justify-center items-center">
										<AvatarImage
											src={message.avatar}
											alt={message.name}
											width={6}
											height={6}
										/>
									</Avatar>
								)}
							</div>
						</motion.div>
					))}
				</AnimatePresence>
			</div>
			<ChatBottombar isMobile={isMobile} loggedInUserData={loggedInUserData} />
		</div>
	);
}

interface ChatBottombarProps {
	isMobile: boolean;
	loggedInUserData: UserData;
}

// biome-ignore lint/suspicious/noExplicitAny: TODO: add links
const bottomIcons: { Icon: any; id: string }[] = []; // [{ icon: Phone }, { icon: Video }, { icon: Info }];

function ChatBottombar({ isMobile, loggedInUserData }: ChatBottombarProps) {
	const [message, setMessage] = React.useState("");
	const inputRef = React.useRef<HTMLTextAreaElement>(null);

	const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setMessage(event.target.value);
	};

	const handleSend = () => {
		if (message.trim()) {
			setMessage("");

			if (inputRef.current) {
				inputRef.current.focus();
			}
		}
	};

	const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			handleSend();
		}

		if (event.key === "Enter" && event.shiftKey) {
			event.preventDefault();
			setMessage((prev) => `${prev}\n`);
		}
	};

	return (
		<div className="p-2 flex justify-between w-full items-center gap-2">
			<div className="flex">
				{/* <Popover>
					<PopoverTrigger asChild>
						<Link
							href="#"
							className={cn(
								buttonVariants({ variant: "ghost", size: "icon" }),
								"h-9 w-9",
								"dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white",
							)}
						>
							<PlusCircle size={20} className="text-muted-foreground" />
						</Link>
					</PopoverTrigger>
					<PopoverContent side="top" className="w-full p-2">
						{message.trim() || isMobile ? (
							<div className="flex gap-2">
								<Link
									href="#"
									className={cn(
										buttonVariants({ variant: "ghost", size: "icon" }),
										"h-9 w-9",
										"dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white",
									)}
								>
									<Mic size={20} className="text-muted-foreground" />
								</Link>
								{BottombarIcons.map((icon, index) => (
									<Link
										key={index}
										href="#"
										className={cn(
											buttonVariants({ variant: "ghost", size: "icon" }),
											"h-9 w-9",
											"dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white",
										)}
									>
										<icon.icon size={20} className="text-muted-foreground" />
									</Link>
								))}
							</div>
						) : (
							<Link
								href="#"
								className={cn(
									buttonVariants({ variant: "ghost", size: "icon" }),
									"h-9 w-9",
									"dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white",
								)}
							>
								<Mic size={20} className="text-muted-foreground" />
							</Link>
						)}
					</PopoverContent>
				</Popover> */}
				{!message.trim() && !isMobile && (
					<div className="flex">
						{bottomIcons.map((icon, index) => (
							<Button asChild size="icon" variant="ghost" key={icon.id}>
								<Link to="#" className="h-9 w-9">
									<icon.Icon className="text-muted-foreground" />
								</Link>
							</Button>
						))}
					</div>
				)}
			</div>

			<AnimatePresence initial={false}>
				<motion.div
					key="input"
					className="w-full relative"
					layout
					initial={{ opacity: 0, scale: 1 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 1 }}
					transition={{
						opacity: { duration: 0.05 },
						layout: {
							type: "spring",
							bounce: 0.15,
						},
					}}
				>
					<Textarea
						autoComplete="off"
						value={message}
						ref={inputRef}
						onKeyDown={handleKeyPress}
						onChange={handleInputChange}
						name="message"
						placeholder="Aa"
						className=" w-full border flex items-center h-9 resize-none overflow-hidden bg-background"
					/>
				</motion.div>

				<Button variant="ghost" size="icon" asChild disabled={!message.trim()}>
					<Link to="#" className="h-9 w-9" onClick={handleSend}>
						<PaperPlaneIcon className="text-muted-foreground" />
					</Link>
				</Button>
			</AnimatePresence>
		</div>
	);
}
