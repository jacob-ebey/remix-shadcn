import { AppLoadContext } from "@remix-run/cloudflare";
import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";

import { DEFAULT_FAILURE_REDIRECT } from "@/config.shared";
import { loginFormSchema } from "@/forms/auth";
import type { AuthorizedUser } from "@/lib/auth";
import { PublicError } from "@/lib/forms";
import { getCookieSessionStorage } from "@/lib/session.server";
import { getUserByLogin } from "@/lib/user.server";

export function getAuthenticator(context: AppLoadContext) {
	const authenticator = new Authenticator<AuthorizedUser>(
		getCookieSessionStorage(context.SESSION_SECRET),
	);

	authenticator.use(
		new FormStrategy(async ({ form }) => {
			const parsed = await loginFormSchema.safeParse(form);
			if (!parsed.success) throw new Error(parsed.error.message);

			const user = await getUserByLogin(context, parsed.data);
			if (!user) throw new PublicError("Invalid email or password", 401);

			return { id: user.id };
		}),
		"form",
	);

	return authenticator;
}

export function getUser(context: AppLoadContext, request: Request) {
	const authenticator = getAuthenticator(context);

	return authenticator.isAuthenticated(request);
}

export function requireUser(context: AppLoadContext, request: Request) {
	const url = new URL(request.url);
	const authenticator = getAuthenticator(context);

	return authenticator.isAuthenticated(request, {
		failureRedirect: `${DEFAULT_FAILURE_REDIRECT}?${new URLSearchParams({
			redirectTo: `${url.pathname}${url.search}`,
		}).toString()}`,
	});
}
