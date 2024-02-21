import "@remix-run/node";

import type { DB } from "@/db.server/schema";

declare module "@remix-run/node" {
	export interface AppLoadContext {
		DB: DB;
		SESSION_SECRET: string;
	}
}
