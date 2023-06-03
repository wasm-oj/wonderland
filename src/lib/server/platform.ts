import { env } from "$env/dynamic/private";

export const KV_COMPONENT = env.KV_COMPONENT
	? env.KV_COMPONENT
	: env.CF_PAGES
	? "cloudflare-kv"
	: undefined;
export const KV_FILE = env.KV_FILE || "kv.json";

export const DB_COMPONENT = env.DB_COMPONENT
	? env.DB_COMPONENT
	: env.CF_PAGES
	? "cloudflare-d1"
	: undefined;
export const SQLITE_FILE = env.SQLITE_FILE || "db.sqlite";

export const CACHE_COMPONENT = env.CACHE_COMPONENT
	? env.CACHE_COMPONENT
	: env.CF_PAGES
	? "cloudflare-cache"
	: undefined;

globalThis.global = globalThis;
