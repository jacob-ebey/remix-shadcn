import { type SubmissionResult } from "@conform-to/react";

import { loginFormSchema } from "@/lib/auth";
import { useForm } from "@/lib/forms";

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
