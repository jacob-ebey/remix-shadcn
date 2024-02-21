import { createCookieSessionStorage } from "@remix-run/cloudflare";

export function getCookieSessionStorage(sessionSecret: string) {
	return createCookieSessionStorage({
		cookie: {
			name: "_session",
			sameSite: "lax",
			path: "/",
			httpOnly: true,
			secrets: [sessionSecret],
			secure: import.meta.env.PROD,
		},
	});
}
