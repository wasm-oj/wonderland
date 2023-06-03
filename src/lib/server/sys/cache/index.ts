// Cache
import { building } from "$app/environment";
import { KV_COMPONENT } from "$lib/server/platform";
import type { BaseCache } from "./base";
import { CloudflareCache } from "./cloudflare-cache";
import { MemoryCache } from "./memory";

export const CACHE: (platform?: App.Platform) => BaseCache = (platform?: App.Platform) =>
	building
		? new MemoryCache()
		: KV_COMPONENT === "cloudflare-cache"
		? new CloudflareCache(platform)
		: new MemoryCache();
