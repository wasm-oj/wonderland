import { fetch_problem, type Problem } from "$lib/server/problem";
import { z } from "sveltekit-api";
import type { RequestEvent } from "@sveltejs/kit";

export * from "../shared";

export const Param = z.object({
	id: z.string().describe("Problem ID"),
});

export const Output = z.object({
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
}) satisfies z.ZodSchema<{ problem: Problem }>;

export default async function (
	param: z.infer<typeof Param>,
	{ platform }: RequestEvent,
): Promise<z.infer<typeof Output>> {
	const problem = await fetch_problem(param.id, platform);

	return {
		problem,
	};
}
