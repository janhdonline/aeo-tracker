// default open-next.config.ts file created by @opennextjs/cloudflare
import { defineCloudflareConfig } from "@opennextjs/cloudflare/config";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

const config = defineCloudflareConfig({
	incrementalCache: r2IncrementalCache,
});

// Prevent infinite recursion: OpenNext runs `npm run build` by default,
// which would re-invoke opennextjs-cloudflare build. Point it at `next build` directly.
config.buildCommand = "next build";

export default config;