import { createCookieSessionStorage } from "@remix-run/node";

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
