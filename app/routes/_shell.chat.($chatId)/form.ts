import { type SubmissionResult } from "@conform-to/react";
import { z } from "zod";
import { zfd } from "zod-form-data";

import { useForm } from "@/lib/forms";

export enum Intents {
	SendMessage = "sendMessage",
}

export const sendMessageFormSchema = zfd.formData({
	message: z
		.string({ required_error: "Display name is required" })
		.trim()
		.min(1, "Message is required"),
});

export function useSendMessageForm(
	lastResult: unknown,
	{ disabled }: { disabled?: boolean } = {},
) {
	return useForm(sendMessageFormSchema, {
		id: "send-message-form",
		lastResult: lastResult as SubmissionResult<string[]> | null | undefined,
		shouldRevalidate: "onBlur",
		shouldValidate: "onSubmit",
		onSubmit(event) {
			if (disabled) {
				event.preventDefault();
				return;
			}
		},
	});
}
