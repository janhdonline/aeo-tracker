// open-next.config.ts — OpenNext Cloudflare configuration
import { defineCloudflareConfig } from "@opennextjs/cloudflare/config";

const config = defineCloudflareConfig({
	// Use the dummy (in-memory) incremental cache instead of R2.
	// R2 requires a payment method on Cloudflare even for the free tier,
	// so we avoid it entirely.
	incrementalCache: "dummy",
});

// Prevent infinite recursion: OpenNext runs `npm run build` by default,
// which would re-invoke opennextjs-cloudflare build. Point it at `next build` directly.
config.buildCommand = "next build";

export default config;