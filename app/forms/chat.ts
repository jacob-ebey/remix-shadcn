import type { SubmissionResult } from "@conform-to/react";
import { z } from "zod";
import { zfd } from "zod-form-data";

import { useForm } from "@/lib/forms";

export const sendMessageFormSchema = zfd.formData({
	agent: z.string().trim().optional(),
	prompt: z.string().trim().optional(),
	message: z
		.string({ required_error: "Message is required" })
		.trim()
		.min(1, "Message is required"),
});

export function useSendMessageForm(
	lastResult: unknown,
	{ disabled }: { disabled?: boolean } = {},
) {
	const [form, fields] = useForm(sendMessageFormSchema, {
		id: "send-message-form",
		lastResult: lastResult as SubmissionResult<string[]> | null | undefined,
		shouldRevalidate: "onBlur",
		shouldValidate: "onSubmit",
		onSubmit(event) {
			const textArea = event.currentTarget.elements.namedItem(
				fields.message.name,
			) as HTMLTextAreaElement | null;

			if (disabled || !textArea) {
				event.preventDefault();
				return;
			}

			const message = textArea.value;
			setTimeout(() => {
				if (textArea && message.trim()) {
					form.reset();
					textArea.style.height = "inherit";
				}
			}, 1);
		},
	});

	return [form, fields] as const;
}

export const updateChatSettingsFormSchema = zfd.formData({
	agentId: z.string().trim().optional(),
	prompt: z.string().trim().optional(),
});

export function useChatSettingsForm(
	lastResult: unknown,
	{ disabled, chatId }: { disabled?: boolean; chatId?: string } = {},
) {
	return useForm(updateChatSettingsFormSchema, {
		id: `update-chat-settings-form-${chatId}`,
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
