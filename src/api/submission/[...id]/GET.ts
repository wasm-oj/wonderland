import { fetch_problem } from "$lib/server/problem";
import type { Problem } from "$lib/server/problem";
import { DB } from "$lib/server/sys/db";
import type { Submission } from "$lib/server/sys/db/schema";
import { sha256 } from "$lib/utils";
import { z } from "sveltekit-api";
import type { RouteModifier } from "sveltekit-api";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "@sveltejs/kit";
import { Modifier as _Modifier } from "../shared";

export const Param = z.object({
	id: z.string().describe("Submission ID"),
});

export const Output = z.object({
	submission: z.object({
		id: z.string(),
		submitter_id: z.string(),
		status: z.enum(["running", "AC", "WA", "SLE", "MLE", "RE", "error"]),
		code: z.string(),
		code_lang: z.string(),
		problem_id: z.string(),
		compiler_version: z.string(),
		runner_version: z.string(),
		score: z.number().nullable(),
		cost: z.number().nullable(),
		memory: z.number().nullable(),
		details: z.string().nullable(),
	}),
	problem: z.object({
		name: z.string(),
		tags: z.array(z.string()).optional(),
		description: z.string(),
		policy: z.array(
			z.object({
				budget: z.number(),
				memory: z.number(),
				score: z.number(),
			}),
		),
		testcase: z.array(
			z.object({
				score: z.number(),
				description: z.string().optional(),
				sample: z.boolean().optional(),
				stdin: z.string().optional(),
				stdout: z.string().optional(),
				stdin_file: z.string().optional(),
				stdout_file: z.string().optional(),
			}),
		),
		input: z.string().optional(),
		output: z.string().optional(),
		hint: z.string().optional(),
	}),
}) satisfies z.ZodSchema<{
	submission: Submission;
	problem: Problem;
}>;

export const Error = {
	404: error(404, "Submission not found"),
};

export const Modifier: RouteModifier = (r) => {
	_Modifier(r);
	r.operationId = "get_submission";
	return r;
};

export default async function (
	param: z.infer<typeof Param>,
	{ locals }: RequestEvent,
): Promise<z.infer<typeof Output>> {
	const db = DB();

	const submission = await db
		.selectFrom("Submission")
		.where("Submission.id", "=", param.id)
		.selectAll()
		.executeTakeFirst();

	if (!submission) {
		throw Error[404];
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
}
