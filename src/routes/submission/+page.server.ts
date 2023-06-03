import { DB } from "$lib/server/sys/db";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
	const db = DB();

	const submissions = await db
		.selectFrom("Submission")
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
		])
		.execute();

	return { submissions };
};
