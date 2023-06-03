import { env } from "$env/dynamic/private";
import type { KVNamespace } from "@cloudflare/workers-types";
import { BaseKV } from "./base";

export class CloudflareKV extends BaseKV {
	private readonly kv: KVNamespace;

	constructor() {
		super();
		this.kv = env.KV as unknown as KVNamespace;
	}

	async get(key: string): Promise<string | null> {
		return this.kv.get(key, "text");
	}

	async set(key: string, value: string, ttl?: number): Promise<void> {
		return this.kv.put(key, value, ttl ? { expirationTtl: ttl } : undefined);
	}

	async del(key: string): Promise<void> {
		return this.kv.delete(key);
	}

	async list(prefix: string | undefined): Promise<string[]> {
		const list: string[] = [];

		let cursor: string | undefined = undefined;
		do {
			// @ts-expect-error Cloudflare KV types are self-referential
			const { keys, list_complete, cursor: c } = await this.kv.list({ prefix, cursor });
			list.push(...keys.map((k) => k.name));
			cursor = list_complete ? undefined : c;
		} while (cursor);

		return list;
	}
}
