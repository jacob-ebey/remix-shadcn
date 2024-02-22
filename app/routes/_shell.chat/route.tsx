import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Outlet, useLoaderData } from "@remix-run/react";
import * as cookie from "cookie";
import * as React from "react";

import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { requireUser } from "@/lib/auth.server";
import { getChatsByUserId } from "@/lib/chats.server";
import { cn } from "@/lib/styles";

import { Sidebar } from "./sidebar";

async function readLayoutCookie(cookieHeader: string | null) {
	const cookies = cookieHeader ? await cookie.parse(cookieHeader) : null;
	const defaultCollapsed =
		cookies?.["react-resizable-panels:collapsed"] === "true";
	const defaultLayout = cookies?.["react-resizable-panels:layout"]
		? JSON.parse(cookies?.["react-resizable-panels:layout"])
		: [];

	return { defaultLayout, defaultCollapsed };
}

export async function loader({ context, request }: LoaderFunctionArgs) {
	const user = await requireUser(context, request);

	const [chats, { defaultCollapsed, defaultLayout }] = await Promise.all([
		getChatsByUserId(context, user.id),
		readLayoutCookie(request.headers.get("Cookie")),
	]);

	return { chats, defaultCollapsed, defaultLayout };
}

export default function Chat() {
	const { chats, defaultCollapsed, defaultLayout } =
		useLoaderData<typeof loader>();

	const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
	const [isMobile, setIsMobile] = React.useState(defaultCollapsed);

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
				<Sidebar isCollapsed={isCollapsed || isMobile} chats={chats} />
			</ResizablePanel>
			<ResizableHandle withHandle />
			<ResizablePanel defaultSize={defaultLayout?.[1]} minSize={30}>
				<Outlet />
			</ResizablePanel>
		</ResizablePanelGroup>
	);
}
