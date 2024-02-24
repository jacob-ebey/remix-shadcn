import * as React from "react";

import type { ButtonProps } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

interface ConfirmationDialogOptions {
	title: string;
	description: string;
	options: (
		| {
				form: string;
				intent: string;
				label: string;
				variant?: ButtonProps["variant"];
		  }
		| {
				form?: undefined;
				intent?: undefined;
				label: string;
				variant?: ButtonProps["variant"];
		  }
	)[];
}

export type ShowConfirmationDialog = (
	options: ConfirmationDialogOptions | null,
) => void;

const confirmationContext = React.createContext<null | {
	current: null | ConfirmationDialogOptions;
	setCurrent: ShowConfirmationDialog;
}>(null);

export function useConfirmationDialog() {
	const [current, setCurrent] =
		React.useState<null | ConfirmationDialogOptions>(null);

	return React.useMemo(
		() => ({
			open: !!current,
			onOpenChange(open: boolean) {
				if (!open) setCurrent(null);
			},
			setOptions(options: ConfirmationDialogOptions | null) {
				setCurrent(options);
			},
			Provider({ children }: { children: React.ReactNode }) {
				return (
					<confirmationContext.Provider value={{ current, setCurrent }}>
						{children}
					</confirmationContext.Provider>
				);
			},
		}),
		[current],
	);
}

export function ConfirmationContent() {
	const { current, setCurrent } = React.useContext(confirmationContext) || {};
	if (!current) return null;

	return (
		current && (
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{current.title}</DialogTitle>
				</DialogHeader>
				<DialogDescription>{current.description}</DialogDescription>
				<DialogFooter>
					{current.options.map((option) => (
						<Button
							key={option.label}
							form={option.form}
							type={option.form ? "submit" : "button"}
							name={option.form ? "intent" : undefined}
							value={option.intent}
							variant={option.variant}
							onClick={(event) => {
								if (setCurrent) {
									const form = event.currentTarget.form;
									if (form) {
										form.requestSubmit(event.currentTarget);
									}

									setCurrent(null);
									event.preventDefault();
								}
							}}
						>
							{option.label}
						</Button>
					))}
				</DialogFooter>
			</DialogContent>
		)
	);
}
