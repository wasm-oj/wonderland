import { env } from "$env/dynamic/private";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import { D1Database } from "./shim.js";

export class CloudflareD1<Schema> extends Kysely<Schema> {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	constructor() {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const db = (env.D1 || env.__D1_BETA__D1) as any;
		if (!db) {
			throw new Error("D1 database not available");
		}

		super({
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			dialect: new D1Dialect({ database: "fetch" in db ? (new D1Database(db) as any) : db }),
		});
	}
}
