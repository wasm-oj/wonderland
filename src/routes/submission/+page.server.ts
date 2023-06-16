import { DB } from "$lib/server/sys/db";
import type { PageServerLoad } from "./$types";

export const load = (async ({ url }) => {
	const db = DB();

	const page = parseInt(url.searchParams.get("page") ?? "1") || 1;
	const offset = (page - 1) * 20;

	let query = db
		.selectFrom("Submission")
		.offset(offset > 0 ? offset : 0)
		.limit(20)
		.orderBy("Submission.id", "desc")
		.select([
			"Submission.id",
			"Submission.code_lang",
			"Submission.problem_id",
			"Submission.status",
			"Submission.submitter_id",
			"Submission.score",
			"Submission.cost",
			"Submission.memory",
		]);

	const lang = url.searchParams.get("lang");
	if (lang) {
		query = query.where("Submission.code_lang", "=", lang);
	}

	const problem = url.searchParams.get("problem");
	if (problem) {
		query = query.where("Submission.problem_id", "=", problem);
	}

	const status = url.searchParams.get("status");
	if (status) {
		query = query.where("Submission.status", "=", status as never);
	}

	const submitter = url.searchParams.get("submitter");
	if (submitter) {
		query = query.where("Submission.submitter_id", "=", submitter);
	}

	const submissions = await query.execute();

	return { submissions };
}) satisfies PageServerLoad;
