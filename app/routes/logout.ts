import { type ActionFunctionArgs, redirect } from "@remix-run/cloudflare";

import { DEFAULT_FAILURE_REDIRECT } from "@/config.shared";
import { getAuthenticator } from "@/lib/auth.server";

export async function loader() {
	throw redirect(DEFAULT_FAILURE_REDIRECT);
}

export async function action({ context, request }: ActionFunctionArgs) {
	const authenticator = getAuthenticator(context);
	await authenticator.logout(request, { redirectTo: DEFAULT_FAILURE_REDIRECT });
}
