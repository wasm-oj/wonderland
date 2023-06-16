import { config } from "$lib/server/config";
import { list_problems } from "$lib/server/problem";
import { DB } from "$lib/server/sys/db";
import type { PageServerLoad } from "./$types";

export const load = (async () => {
	const db = DB();
	const [cfg, user_count, submission_count, problem_count] = await Promise.all([
		config(),
		db
			.selectFrom("User")
			.select((eb) => eb.fn.countAll<number>().as("n"))
			.executeTakeFirstOrThrow()
			.then((r) => r.n),
		db
			.selectFrom("Submission")
			.select((eb) => eb.fn.countAll<number>().as("n"))
			.executeTakeFirstOrThrow()
			.then((r) => r.n),
		list_problems().then((r) => r.length),
	]);

	return {
		cfg: {
			compilers: cfg.compiler.length,
			runners: cfg.runner.length,
		},
		stat: {
			user: user_count,
			submission: submission_count,
			problem: problem_count,
		},
	};
}) satisfies PageServerLoad;
