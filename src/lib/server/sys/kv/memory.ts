import { BaseKV } from "./base";

const _kv: Map<string, string> = new Map();

export class MemoryKV extends BaseKV {
	async get(key: string): Promise<string | null> {
		return _kv.get(key) ?? null;
	}

	async set(key: string, value: string): Promise<void> {
		_kv.set(key, value);
	}

	async del(key: string): Promise<void> {
		_kv.delete(key);
	}

	async list(prefix: string | undefined): Promise<string[]> {
		return [..._kv.keys()].filter((k) => !prefix || k.startsWith(prefix));
	}
}
