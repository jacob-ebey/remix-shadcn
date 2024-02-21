import { useNavigation } from "@remix-run/react";

import { cn } from "@/lib/styles";

export function GlobalPendingIndicator() {
	const navigation = useNavigation();
	const pending = navigation.state !== "idle";

	return (
		<div className={cn("fixed top-0 left-0 right-0", { hidden: !pending })}>
			<div className="h-0.5 w-full bg-muted overflow-hidden">
				<div className="animate-progress w-full h-full bg-muted-foreground origin-left-right" />
			</div>
		</div>
	);
}
