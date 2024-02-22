import type { SimpleChatModel } from "@langchain/core/language_models/chat_models";
import "@remix-run/cloudflare";

import type { DB } from "@/db.server/schema";

declare module "@remix-run/cloudflare" {
	export interface AppLoadContext {
		AI: SimpleChatModel;
		DB: DB;
		SESSION_SECRET: string;
	}
}
