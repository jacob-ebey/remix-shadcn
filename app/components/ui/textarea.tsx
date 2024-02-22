import * as React from "react";

import { cn } from "@/lib/styles";

export interface TextareaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, ...props }, ref) => {
		return (
			<textarea
				className={cn(
					"flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
					className,
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);
Textarea.displayName = "Textarea";

function useAutoHeightTextArea() {
	const ref = React.useRef<HTMLTextAreaElement>(null);

	const adjustHeight = () => {
		const textbox = ref.current;
		if (!textbox) return;
		textbox.style.height = "inherit";
		textbox.style.height = `${textbox.scrollHeight}px`;
	};

	React.useEffect(adjustHeight, []);

	return {
		ref,
		onInput() {
			adjustHeight();
		},
	};
}

export { Textarea, useAutoHeightTextArea };
