import { SubmissionResult } from "@conform-to/dom";
import { z } from "zod";
import { zfd } from "zod-form-data";

import { useForm } from "@/lib/forms";

export enum Intents {
	ClearChats = "clearChats",
	Login = "login",
	SendMessage = "sendMessage",
	Signup = "signup",
	UpdateAccount = "updateAccount",
	UpdateChatSettings = "updateChatSettings",
	UpdateGlobalPrompt = "updateGlobalPrompt",
}

export const loginFormSchema = zfd.formData({
	email: z
		.string({ required_error: "Email is required" })
		.trim()
		.min(1, "Email is required")
		.email("Invalid email"),
	password: z.string({ required_error: "Password is required" }),
});

export function useLoginForm(
	lastResult: unknown,
	{ disabled }: { disabled?: boolean } = {},
) {
	return useForm(loginFormSchema, {
		id: "login-form",
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

export function useUpdateAccountForm(
	lastResult: unknown,
	{ disabled }: { disabled?: boolean } = {},
) {
	return useForm(updateAccountFormSchema, {
		id: "account-form",
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

export const updateAccountFormSchema = zfd.formData({
	displayName: z
		.string({ required_error: "Display name is required" })
		.trim()
		.min(1, "Display name is required"),
	fullName: z
		.string({ required_error: "Full name is required" })
		.trim()
		.min(1, "Full name is required"),
});
export const sendMessageFormSchema = zfd.formData({
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
	prompt: z.string().trim().optional(),
});

export function useChatSettingsForm(
	lastResult: unknown,
	{ disabled }: { disabled?: boolean } = {},
) {
	return useForm(updateChatSettingsFormSchema, {
		id: "update-chat-settings-form",
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

export const updateGlobalPromptFormSchema = zfd.formData({
	prompt: z.string().trim().optional(),
});

export function useGlobalPromptForm(
	lastResult: unknown,
	{ disabled }: { disabled?: boolean } = {},
) {
	return useForm(updateGlobalPromptFormSchema, {
		id: "update-global-prompt-form",
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
