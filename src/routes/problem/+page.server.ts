import { list_problems } from "$lib/server/problem";
import { DB } from "$lib/server/sys/db";
import type { PageServerLoad } from "./$types";

export const load = (async ({ platform }) => {
	const problems_p = list_problems(platform);

	const db = DB();

	const records = await db
		.selectFrom("Submission")
		.groupBy(["Submission.problem_id", "Submission.status"])
		.select([
			"Submission.problem_id as p",
			"Submission.status as s",
			(eb) => eb.fn.countAll<number>().as("c"),
		])
		.execute();

	const sub: Record<string, Record<string, number>> = {};
	for (const record of records) {
		const p = record.p;
		const s = record.s;
		const c = record.c;
		if (!sub[p]) {
			sub[p] = {};
		}
		sub[p][s] = c;
	}

	const problems = await problems_p;

	return {
		problems: problems.map((p) => ({
			...p,
			sub: sub[p.id] || {},
		})),
	};
}) satisfies PageServerLoad;
