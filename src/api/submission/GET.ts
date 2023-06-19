import { DB } from "$lib/server/sys/db";
import { z } from "sveltekit-api";

export const Query = z.object({
	page: z
		.string()
		.default("1")
		.transform((v) => parseInt(v))
		.pipe(z.number().min(1)),
	lang: z.string().optional(),
	problem: z.string().optional(),
	status: z.enum(["running", "AC", "WA", "SLE", "MLE", "RE", "error"]).optional(),
	submitter: z.string().optional(),
});

export const Output = z.object({
	submissions: z.array(
		z.object({
			id: z.string(),
			code_lang: z.string(),
			problem_id: z.string(),
			status: z.enum(["running", "AC", "WA", "SLE", "MLE", "RE", "error"]),
			submitter_id: z.string(),
			score: z.number().nullable(),
			cost: z.number().nullable(),
			memory: z.number().nullable(),
		}),
	),
});

export default async function (param: z.infer<typeof Query>): Promise<z.infer<typeof Output>> {
	const db = DB();

	const offset = (param.page - 1) * 20;

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

	if (param.lang) {
		query = query.where("Submission.code_lang", "=", param.lang);
	}

	if (param.problem) {
		query = query.where("Submission.problem_id", "=", param.problem);
	}

	if (param.status) {
		query = query.where("Submission.status", "=", param.status);
	}

	if (param.submitter) {
		query = query.where("Submission.submitter_id", "=", param.submitter);
	}

	const submissions = await query.execute();

	return { submissions };
}
