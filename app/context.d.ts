import "@remix-run/cloudflare";

import type { DB } from "@/db.server/schema";

declare module "@remix-run/cloudflare" {
	export interface AppLoadContext {
		DB: DB;
		SESSION_SECRET: string;
	}
}
