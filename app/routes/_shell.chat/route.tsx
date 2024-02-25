import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import type { ShouldRevalidateFunctionArgs } from "@remix-run/react";
import { Outlet, useLoaderData } from "@remix-run/react";
import * as cookie from "cookie";
import * as React from "react";
import { useHydrated } from "remix-utils/use-hydrated";

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

export function shouldRevalidate({
	defaultShouldRevalidate,
	currentParams,
	nextParams,
}: ShouldRevalidateFunctionArgs) {
	if (!currentParams.userId && nextParams.userId) return true;

	return defaultShouldRevalidate;
}

export default function ChatLayout() {
	const { chats, defaultCollapsed, defaultLayout } =
		useLoaderData<typeof loader>();
	const hydrated = useHydrated();

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
				defaultSize={defaultLayout?.[0] ?? 10}
				collapsedSize={isMobile ? 0 : 16}
				collapsible={true}
				minSize={16}
				maxSize={isMobile ? 90 : 30}
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
				className={cn(isCollapsed && "transition-all duration-300 ease-in-out")}
			>
				<Sidebar isCollapsed={isCollapsed} chats={chats} />
			</ResizablePanel>
			<ResizableHandle withHandle />
			<ResizablePanel defaultSize={defaultLayout?.[1] ?? 80} minSize={10}>
				<Outlet />
			</ResizablePanel>
		</ResizablePanelGroup>
	);
}
