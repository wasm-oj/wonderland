import { BaseCache } from "./base";

const _cache: Map<string, Response> = new Map();

export class MemoryCache extends BaseCache {
	async match(key: string): Promise<Response | undefined> {
		const res = _cache.get(key);
		return res ? res.clone() : undefined;
	}

	async put(key: string, response: Response): Promise<void> {
		_cache.set(key, response);
	}

	async delete(key: string): Promise<void> {
		_cache.delete(key);
	}
}
