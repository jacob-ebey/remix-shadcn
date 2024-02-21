import { type SubmissionResult } from "@conform-to/react";
import { z } from "zod";
import { zfd } from "zod-form-data";

import { useForm } from "@/lib/forms";

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
