import { config } from "$lib/server/config";
import { list_problems } from "$lib/server/problem";
import { DB } from "$lib/server/sys/db";
import { z } from "sveltekit-api";

export const Output = z.object({
	cfg: z.object({
		compilers: z.number().describe("Number of compilers configured"),
		runners: z.number().describe("Number of runners configured"),
	}),
	stat: z.object({
		user: z.number().describe("Number of users"),
		submission: z.number().describe("Number of submissions"),
		problem: z.number().describe("Number of problems"),
	}),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default async function (_: Record<never, never>): Promise<z.infer<typeof Output>> {
	const cfg = await config();

	return {
		cfg: {
			compilers: cfg.compiler.length,
			runners: cfg.runner.length,
		},
		stat: await stats(),
	};
}

async function stats(): Promise<{
	user: number;
	submission: number;
	problem: number;
}> {
	const db = DB();
	const [user_count, submission_count, problem_count] = await Promise.all([
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
		user: user_count,
		submission: submission_count,
		problem: problem_count,
	};
}
