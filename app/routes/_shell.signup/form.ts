import { type SubmissionResult } from "@conform-to/react";
import { z } from "zod";
import { zfd } from "zod-form-data";

import { useForm } from "@/lib/forms";

export const PASSWORD_MIN_LENGTH = 8;

export const signupFormSchema = zfd
	.formData({
		email: z
			.string({ required_error: "Email is required" })
			.trim()
			.min(1, "Email is required")
			.email("Invalid email"),
		displayName: z
			.string({ required_error: "Display name is required" })
			.trim()
			.min(1, "Display name is required"),
		fullName: z
			.string({ required_error: "Full name is required" })
			.trim()
			.min(1, "Full name is required"),
		password: z
			.string({ required_error: "Password is required" })
			.min(
				PASSWORD_MIN_LENGTH,
				`Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
			),
		verifyPassword: z
			.string({ required_error: "Verification is required" })
			.min(
				PASSWORD_MIN_LENGTH,
				`Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
			),
	})
	.refine((data) => data.password === data.verifyPassword, {
		message: "Passwords must match",
		path: ["verifyPassword"],
	});

export function useSignupForm(
	lastResult: unknown,
	{ disabled }: { disabled?: boolean } = {},
) {
	return useForm(signupFormSchema, {
		id: "signup-form",
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
