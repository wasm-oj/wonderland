import { SQLITE_FILE } from "$lib/server/platform";
import type { Database as DBInstance } from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";

export class SQLiteDB<Schema> extends Kysely<Schema> {
	constructor() {
		super({
			dialect: new SqliteDialect({
				database: async () => {
					const lib = "better-sqlite3";
					const { default: DB } = await import(/* @vite-ignore */ lib);
					return new DB(SQLITE_FILE, { verbose: console.log }) as DBInstance;
				},
			}),
		});
	}
}
