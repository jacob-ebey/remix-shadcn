import {
	cloudflareDevProxyVitePlugin,
	vitePlugin as remix,
} from "@remix-run/dev";
import { defineConfig } from "vite";
import envOnly from "vite-env-only";
import tsconfigPaths from "vite-tsconfig-paths";

import type { Env } from "./context";

export default defineConfig({
	plugins: [
		envOnly(),
		tsconfigPaths(),
		cloudflareDevProxyVitePlugin<Env, CfProperties>({
			getLoadContext: async ({
				context: {
					cloudflare: { env },
				},
			}) => {
				const { getLoadContext } = await import("./context");
				return getLoadContext(env);
			},
		}),
		remix({
			future: {
				v3_fetcherPersist: true,
				v3_relativeSplatPath: true,
				v3_throwAbortReason: true,
			},
		}),
	],
});
