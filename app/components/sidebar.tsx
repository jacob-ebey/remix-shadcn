import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/styles";
import { DotsHorizontalIcon, Pencil1Icon } from "@radix-ui/react-icons";
import { Link } from "@remix-run/react";
import { Avatar, AvatarImage } from "./ui/avatar";

interface SidebarProps {
	isCollapsed: boolean;
	links: {
		name: string;
		messages: {
			id: number;
			avatar: string;
			name: string;
			message: string;
		}[];
		avatar: string;
		variant: "grey" | "ghost";
	}[];
	onClick?: () => void;
	isMobile: boolean;
}

export function Sidebar({ links, isCollapsed, isMobile }: SidebarProps) {
	return (
		<div
			data-collapsed={isCollapsed}
			className="relative group flex flex-col h-full gap-4 p-2 data-[collapsed=true]:p-2"
		>
			{!isCollapsed && (
				<div className="flex justify-between p-2 items-center">
					<div className="flex gap-2 items-center text-2xl">
						<p className="font-medium">Chats</p>
						<span className="text-zinc-300">({links.length})</span>
					</div>

					<div className="flex">
						<Button asChild size="icon" variant="ghost">
							<Link to="#" className="h-9 w-9">
								<DotsHorizontalIcon />
							</Link>
						</Button>

						<Button asChild size="icon" variant="ghost">
							<Link to="#" className="h-9 w-9">
								<Pencil1Icon />
							</Link>
						</Button>
					</div>
				</div>
			)}
			<nav className="grid gap-1 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]">
				{links.map((link, index) =>
					isCollapsed ? (
						<TooltipProvider key={`${index}${link.name}`}>
							<Tooltip delayDuration={0}>
								<TooltipTrigger asChild>
									<Button
										asChild
										size="icon"
										variant="ghost"
										className="w-14 h-14"
									>
										<Link to="#">
											<Avatar className="flex justify-center items-center">
												<AvatarImage
													src={link.avatar}
													alt={link.avatar}
													width={6}
													height={6}
													className="w-10 h-10"
												/>
											</Avatar>{" "}
											<span className="sr-only">{link.name}</span>
										</Link>
									</Button>
								</TooltipTrigger>
								<TooltipContent
									side="right"
									className="flex items-center gap-4"
								>
									{link.name}
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					) : (
						<Button
							key={`${index}${link.name}`}
							size="lg"
							variant="ghost"
							asChild
							className="justify-start gap-4 py-2 flex h-auto"
						>
							<Link to="#">
								<Avatar className="flex justify-center items-center">
									<AvatarImage
										src={link.avatar}
										alt={link.avatar}
										width={6}
										height={6}
										className="w-10 h-10 "
									/>
								</Avatar>
								<div className="flex flex-col max-w-28">
									<span>{link.name}</span>
									{(link.messages?.length ?? 0) > 0 && (
										<span className="text-zinc-300 text-xs truncate ">
											{
												link.messages[link.messages.length - 1].name.split(
													" ",
												)[0]
											}
											: {link.messages[link.messages.length - 1].message}
										</span>
									)}
								</div>
							</Link>
						</Button>
					),
				)}
			</nav>
		</div>
	);
}
