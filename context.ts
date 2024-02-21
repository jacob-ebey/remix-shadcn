import { AppLoadContext } from "@remix-run/cloudflare";

// biome-ignore lint/suspicious/noEmptyInterface: Fill this in with your own types for your use-case
export interface Env {}

export function getLoadContext(env: Env): AppLoadContext {
	return {};
}
