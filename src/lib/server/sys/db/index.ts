// DB is used to store more complex objects that will only be access when needed
import { building } from "$app/environment";
import { DB_COMPONENT } from "$lib/server/platform";
import type { Kysely } from "kysely";
import { CloudflareD1 } from "./cloudflare-d1";
import type { Database } from "./schema";
import { SQLiteDB } from "./sqlite";
import { UnimplementedDB } from "./unimplemented";

export function DB(): Kysely<Database> {
	if (building) {
		return new UnimplementedDB();
	}

	if (DB_COMPONENT === "cloudflare-d1") {
		return new CloudflareD1();
	}

	if (DB_COMPONENT === "sqlite") {
		return new SQLiteDB();
	}

	return new UnimplementedDB();
}
