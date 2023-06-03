import { fetch_problem } from "$lib/server/problem";
import { DB } from "$lib/server/sys/db";
import { sha256 } from "$lib/utils";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
	const db = DB();

	const submission = await db
		.selectFrom("Submission")
		.where("Submission.id", "=", params.id)
		.selectAll()
		.executeTakeFirst();

	if (!submission) {
		throw error(404, "Submission not found");
	}

	const problem_p = fetch_problem(submission.problem_id);

	const hash = locals.token ? await sha256(locals.token.sub) : "";

	if (hash !== submission.submitter_id) {
		submission.code = "";
	}

	const problem = await problem_p;

	return {
		submission,
		problem,
	};
};
