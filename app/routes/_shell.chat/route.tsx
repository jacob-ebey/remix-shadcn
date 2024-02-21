import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { createCookie } from "@remix-run/cloudflare";
import * as cookie from "cookie";
import * as React from "react";
import { ClientOnly } from "remix-utils/client-only";

import type { Message, UserData } from "@/components/chat";
import { ChatList, ChatTopBar } from "@/components/chat";
import { Sidebar } from "@/components/sidebar";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { requireUser } from "@/lib/auth.server";
import { cn } from "@/lib/styles";
import { useLoaderData } from "@remix-run/react";

const users: UserData[] = [
	{
		avatar: "https://placehold.co/400",
		id: "1",
		name: "John Doe",
	},
	{
		avatar: "https://placehold.co/400",
		id: "2",
		name: "Jane Doe",
	},
	{
		avatar: "https://placehold.co/400",
		id: "3",
		name: "John Smith",
	},
	{
		avatar: "https://placehold.co/400",
		id: "4",
		name: "Jane Smith",
	},
];

const messages: Message[] = [
	{
		avatar: "https://placehold.co/400",
		id: 1,
		message: "Hey, how are you?",
		name: "John Doe",
	},
	{
		avatar: "https://placehold.co/400",
		id: 2,
		message: "I'm good, thank you.",
		name: "Jane Doe",
	},
	{
		avatar: "https://placehold.co/400",
		id: 3,
		message: "What are you doing?",
		name: "John Doe",
	},
	{
		avatar: "https://placehold.co/400",
		id: 4,
		message: "I'm just chilling.",
		name: "Jane Doe",
	},
];

export async function loader({ context, request }: LoaderFunctionArgs) {
	await requireUser(context, request);

	const cookieHeader = request.headers.get("Cookie");
	const cookies = cookieHeader ? await cookie.parse(cookieHeader) : null;
	const defaultCollapsed =
		cookies?.["react-resizable-panels:collapsed"] === "true";
	const defaultLayout = cookies?.["react-resizable-panels:layout"]
		? JSON.parse(cookies?.["react-resizable-panels:layout"])
		: [];

	return { defaultLayout, defaultCollapsed };
}

export default function Chat() {
	const { defaultCollapsed, defaultLayout } = useLoaderData<typeof loader>();

	const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
	const [isMobile, setIsMobile] = React.useState(false);

	React.useEffect(() => {
		const checkScreenWidth = () => {
			setIsMobile(window.innerWidth <= 768);
		};

		// Initial check
		checkScreenWidth();

		// Event listener for screen width changes
		window.addEventListener("resize", checkScreenWidth);

		// Cleanup the event listener on component unmount
		return () => {
			window.removeEventListener("resize", checkScreenWidth);
		};
	}, []);

	return (
		<ResizablePanelGroup
			direction="horizontal"
			onLayout={(sizes: number[]) => {
				document.cookie = `react-resizable-panels:layout=${JSON.stringify(
					sizes,
				)}; Path=/chat`;
			}}
			className="h-full items-stretch"
		>
			<ResizablePanel
				defaultSize={defaultLayout?.[0]}
				collapsedSize={8}
				collapsible={true}
				minSize={isMobile ? 0 : 24}
				maxSize={isMobile ? 8 : 30}
				onCollapse={() => {
					setIsCollapsed(true);
					document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
						true,
					)}; Path=/chat`;
				}}
				onExpand={() => {
					setIsCollapsed(false);
					document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
						false,
					)}; Path=/chat`;
				}}
				className={cn(
					isCollapsed &&
						"min-w-[50px] md:min-w-[70px] transition-all duration-300 ease-in-out",
				)}
			>
				<Sidebar
					isCollapsed={isCollapsed || isMobile}
					links={users}
					isMobile={isMobile}
				/>
			</ResizablePanel>
			<ResizableHandle withHandle />
			<ResizablePanel defaultSize={defaultLayout?.[1]} minSize={30}>
				<div className="flex flex-col justify-between w-full h-full">
					<ChatTopBar selectedUser={users[0]} />

					<ChatList
						messages={messages}
						selectedUser={users[0]}
						isMobile={isMobile}
						loggedInUserData={users[0]}
					/>
				</div>
			</ResizablePanel>
		</ResizablePanelGroup>
	);
}
