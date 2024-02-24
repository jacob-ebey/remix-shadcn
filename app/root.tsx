import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	isRouteErrorResponse,
	useNavigate,
	useRouteError,
} from "@remix-run/react";
import * as React from "react";
import { RouterProvider } from "react-aria-components";

import { GlobalPendingIndicator } from "@/components/global-pending-indicator";
import {
	ThemeSwitcherSafeHTML,
	ThemeSwitcherScript,
} from "@/components/theme-switcher";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

function NavProvider({ children }: { children: React.ReactNode }) {
	const navigate = useNavigate();
	return <RouterProvider navigate={navigate}>{children}</RouterProvider>;
}

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<NavProvider>
			<ThemeSwitcherSafeHTML
				lang="en"
				className="touch-manipulation overflow-x-hidden"
			>
				<head>
					<meta charSet="utf-8" />
					<meta
						name="viewport"
						content="width=device-width, initial-scale=1, user-scalable=no"
					/>
					<Meta />
					<Links />
					<ThemeSwitcherScript />
				</head>
				<body>
					<GlobalPendingIndicator />
					<TooltipProvider>{children}</TooltipProvider>
					<ScrollRestoration />
					<Scripts />
				</body>
			</ThemeSwitcherSafeHTML>
		</NavProvider>
	);
}

export default function Root() {
	return <Outlet />;
}

export function ErrorBoundary() {
	const error = useRouteError();
	let status = 500;
	let message = "An unexpected error occurred.";
	if (isRouteErrorResponse(error)) {
		status = error.status;
		switch (error.status) {
			case 404:
				message = "Page Not Found";
				break;
		}
	} else {
		console.error(error);
	}

	return (
		<div className="container prose py-8">
			<h1>{status}</h1>
			<p>{message}</p>
		</div>
	);
}
