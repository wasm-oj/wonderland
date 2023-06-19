import { list_problems } from "$lib/server/problem";
import { DB } from "$lib/server/sys/db";
import { z } from "sveltekit-api";
import type { RequestEvent } from "@sveltejs/kit";

export const Output = z.object({
	problems: z
		.array(
			z
				.object({
					sub: z.record(z.number()).describe("Submission count of each status"),
					id: z.string().describe("Problem ID"),
					name: z.string().describe("Problem name"),
					tags: z.array(z.string()).describe("Problem tags"),
				})
				.describe("Problem"),
		)
		.describe("List of problems"),
});

export default async function (
	_query: Record<never, never>,
	{ platform }: RequestEvent,
): Promise<z.infer<typeof Output>> {
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
		const { p, s, c } = record;
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
}
