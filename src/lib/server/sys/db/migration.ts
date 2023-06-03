import { sql } from "kysely";
import type { Kysely } from "kysely";
import type { Database } from "./schema";

export async function up(db: Kysely<Database>): Promise<void> {
	await db.schema
		.createTable("User")
		.addColumn("id", "text", (col) => col.primaryKey())
		.addColumn("email", "text", (col) => col.notNull().unique())
		.addColumn("name", "text", (col) => col.notNull().check(sql`length(name) > 0`))
		.addColumn("bio", "text", (col) => col.notNull())
		.addColumn("avatar", "text", (col) => col.notNull())
		.execute();

	await db.schema
		.createTable("Submission")
		.addColumn("id", "text", (col) => col.primaryKey())
		.addColumn("submitter_id", "text", (col) => col.notNull().references("User.id"))
		.addColumn("status", "text", (col) =>
			col
				.notNull()
				.check(sql`status IN ('running', 'AC', 'WA', 'SLE', 'MLE', 'RE', 'error')`),
		)
		.addColumn("code", "text", (col) => col.notNull())
		.addColumn("code_lang", "text", (col) => col.notNull())
		.addColumn("problem_id", "text", (col) => col.notNull())
		.addColumn("compiler_version", "text", (col) => col.notNull())
		.addColumn("runner_version", "text", (col) => col.notNull())
		.addColumn("score", "integer")
		.addColumn("cost", "integer")
		.addColumn("memory", "integer")
		.addColumn("details", "text")
		.execute();

	await db.schema
		.createIndex("submission_problem_id_index")
		.on("Submission")
		.column("problem_id")
		.execute();
	await db.schema
		.createIndex("submission_status_index")
		.on("Submission")
		.column("status")
		.execute();
	await db.schema
		.createIndex("submission_code_lang_index")
		.on("Submission")
		.column("code_lang")
		.execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
	await db.schema.dropTable("User").execute();
	await db.schema.dropTable("Submission").execute();
}
