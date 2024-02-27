import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Link, Outlet, useLocation } from "@remix-run/react";

export default function Agents() {
	const location = useLocation();

	return (
		<main className="container py-8">
			<Card className="w-full max-w-screen-sm mx-auto">
				<CardHeader className="space-y-1">
					<CardTitle>AI Agents</CardTitle>
					<CardDescription>
						Create and edit AI agents to aid you in your flow.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{location.pathname.match(/\/agents\/?$/) ? (
						<>
							<Button asChild>
								<Link to="/agents/create">Create agent</Link>
							</Button>
						</>
					) : (
						<Button asChild variant="ghost">
							<Link to="/agents">Back to agents</Link>
						</Button>
					)}

					<Outlet />
				</CardContent>
			</Card>
		</main>
	);
}
