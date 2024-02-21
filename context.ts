import { AppLoadContext } from "@remix-run/cloudflare";
import { drizzle } from "drizzle-orm/d1";

import schema from "./app/db.server/schema";

export interface Env {
	DB: D1Database;
	SESSION_SECRET: string;
}

export function getLoadContext(env: Env): AppLoadContext {
	return {
		DB: drizzle(env.DB, { schema }),
		SESSION_SECRET: env.SESSION_SECRET,
	};
}
