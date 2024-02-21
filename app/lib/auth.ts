import { z } from "zod";
import { zfd } from "zod-form-data";

export type AuthorizedUser = {
	id: string;
};

export const loginFormSchema = zfd.formData({
	email: z
		.string({ required_error: "Email is required" })
		.trim()
		.min(1, "Email is required")
		.email("Invalid email"),
	password: z.string({ required_error: "Password is required" }),
});
