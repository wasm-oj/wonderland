import type { Cache } from "@cloudflare/workers-types";
import { BaseCache } from "./base";

export class CloudflareCache extends BaseCache {
	private readonly cache: Promise<Cache>;
	private readonly platform: App.Platform;

	constructor(platform?: App.Platform) {
		super();
		if (!platform?.caches) {
			throw new Error("Cloudflare cache not available");
		}

		this.platform = platform;
		this.cache = platform.caches.open("wow");
	}

	async match(key: string): Promise<Response | undefined> {
		const res = await this.cache.then((c) => c.match(key));
		// @ts-expect-error Cloudflare cache type is not matched
		return res;
	}

	async put(key: string, response: Response): Promise<void> {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.platform.context?.waitUntil(this.cache.then((c) => c.put(key, response as any)));
	}

	async delete(key: string): Promise<void> {
		await this.cache.then((c) => c.delete(key));
	}
}
