// Since KV should be think as a fast-to-read storage
// It is used for config-like objects that will be used frequently
import { building } from "$app/environment";
import { KV_COMPONENT } from "$lib/server/platform";
import type { BaseKV } from "./base";
import { CloudflareKV } from "./cloudflare-kv";
import { JsonKV } from "./json";
import { MemoryKV } from "./memory";

export const KV: (platform?: App.Platform) => BaseKV = () =>
	building
		? new MemoryKV()
		: KV_COMPONENT === "cloudflare-kv"
		? new CloudflareKV()
		: KV_COMPONENT === "json"
		? new JsonKV()
		: new MemoryKV();
