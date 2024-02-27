import { ChatCloudflareWorkersAI } from "@langchain/cloudflare";
import { AppLoadContext } from "@remix-run/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import "langsmith";

import schema from "./app/db.server/schema";

export interface Env {
	CLOUDFLARE_ACCOUNT_ID: string;
	CLOUDFLARE_WORKERS_AI_API_TOKEN: string;
	DB: D1Database;
	SESSION_SECRET: string;
}

export function getLoadContext(env: Env): AppLoadContext {
	return {
		AI: new ChatCloudflareWorkersAI({
			cloudflareAccountId: env.CLOUDFLARE_ACCOUNT_ID,
			cloudflareApiToken: env.CLOUDFLARE_WORKERS_AI_API_TOKEN,
			// model: "@cf/meta/llama-2-7b-chat-fp16",
			// model: "@hf/thebloke/llama-2-13b-chat-awq",
			model: "@hf/thebloke/neural-chat-7b-v3-1-awq",
			// model: "@hf/thebloke/openhermes-2.5-mistral-7b-awq",
			// maxRetries: 0,
		}),
		DB: drizzle(env.DB, { schema }),
		SESSION_SECRET: env.SESSION_SECRET,
	};
}
