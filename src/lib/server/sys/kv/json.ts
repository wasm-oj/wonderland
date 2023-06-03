import { KV_FILE } from "$lib/server/platform";
import { BaseKV } from "./base";

const module = "node:fs";

export class JsonKV extends BaseKV {
	private readonly file: string;
	private data = new Map<string, [string, number]>();
	private writer: NodeJS.Timeout | undefined;
	private ready: Promise<void> | undefined;

	constructor() {
		super();
		this.file = KV_FILE;

		this.deserialize();

		import(/* @vite-ignore */ module).then(({ watchFile }) => {
			watchFile(this.file, () => {
				console.log("KV file changed");
				this.deserialize();
			});
		});
	}

	private serialize(): void {
		const now = Date.now();
		for (const [key, [, ttl]] of this.data) {
			if (ttl && ttl < now) {
				this.data.delete(key);
			}
		}
		const data = JSON.stringify([...this.data]);
		import(/* @vite-ignore */ module).then(({ writeFile }) => {
			writeFile(this.file, data, "utf8");
		});
	}

	private deserialize(): void {
		this.ready = new Promise((resolve) => {
			import(/* @vite-ignore */ module).then(({ existsSync, readFileSync }) => {
				if (existsSync(this.file)) {
					const data = readFileSync(this.file, "utf8");
					this.data = new Map(JSON.parse(data));
					console.log("KV file loaded", this.data.size);
				}
				resolve();
			});
		});
	}

	private schedule_write(): void {
		if (this.writer) {
			clearTimeout(this.writer);
		}
		this.writer = setTimeout(() => {
			this.writer = undefined;
			this.serialize();
		}, 1000);
	}

	async get(key: string): Promise<string | null> {
		await this.ready;
		const value = this.data.get(key);
		if (value) {
			const [data, ttl] = value;
			if (ttl && ttl < Date.now()) {
				this.data.delete(key);
				this.schedule_write();
				return null;
			}
			return data;
		}
		return null;
	}

	async set(key: string, value: string, ttl?: number): Promise<void> {
		await this.ready;
		this.data.set(key, [value, ttl ? Date.now() + ttl * 1000 : 1e13]);
		this.schedule_write();
	}

	async del(key: string): Promise<void> {
		await this.ready;
		this.data.delete(key);
		this.schedule_write();
	}

	async list(prefix: string | undefined): Promise<string[]> {
		await this.ready;
		const keys = [...this.data.keys()];
		if (prefix) {
			return keys.filter((key) => key.startsWith(prefix));
		}
		return keys;
	}
}
