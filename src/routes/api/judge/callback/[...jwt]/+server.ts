import { config } from "$lib/server/config";
import { fetch_problem } from "$lib/server/problem";
import { DB } from "$lib/server/sys/db";
import { JWT } from "sveltekit-jwt";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ params, request }) => {
	const db = DB();
	const cfg = await config();

	const ok = await JWT.verify(params.jwt, cfg.app.secret);
	if (!ok) {
		console.log("Invalid JWT, Unauthorized");
		throw error(401, "Unauthorized");
	}

	const { payload } = JWT.decode(params.jwt);
	if (!payload.sub) {
		console.log("Invalid JWT");
		throw error(400, "Invalid JWT");
	}
	console.log("JWT", payload);

	const problem_p = fetch_problem(payload.problem);

	const result = await request.json<{
		error: string | null;
		results: {
			success: boolean;
			cost: number | null;
			memory: number | null;
			message: string | null;
			exception: {
				type: string;
				reason: string;
			} | null;
		}[];
	}>();
	console.log("Result", result);

	const problem = await problem_p;

	const status = {
		WA: 0,
		SLE: 0,
		MLE: 0,
		RE: 0,
		AC: 0,
	};
	let score = 0;
	let cost = 0;
	let memory = 0;

	const details: {
		status: "AC" | "WA" | "SLE" | "MLE" | "RE";
		cost: number;
		memory: number;
	}[][] = problem.testcase.map((testcase, i) => {
		const res = result.results[i];

		if (res.exception) {
			if (res.exception.type === "Output") {
				status.WA++;
				return Array(problem.policy.length).fill({
					status: "WA",
					cost: res.cost || 0,
					memory: res.memory || 0,
				});
			}
			if (res.exception.type === "Execution") {
				let current_status = res.exception.reason;
				if (current_status === "IOE" || current_status === "CE") {
					current_status = "RE";
				}

				status[current_status as keyof typeof status]++;
				return Array(problem.policy.length).fill({
					status: current_status,
					cost: res.cost || 0,
					memory: res.memory || 0,
				});
			}
		}

		if (!res.cost || !res.memory || !res.success) {
			status.RE++;
			return Array(problem.policy.length).fill({
				status: "RE",
				cost: res.cost || 0,
				memory: res.memory || 0,
			});
		}

		cost = Math.max(cost, res.cost);
		memory = Math.max(memory, res.memory);

		const c = res.cost,
			m = res.memory;
		return problem.policy.map((policy) => {
			if (c > policy.budget) {
				status.SLE++;
				return {
					status: "SLE",
					cost: c,
					memory: m,
				};
			}
			if (m > policy.memory) {
				status.MLE++;
				return {
					status: "MLE",
					cost: c,
					memory: m,
				};
			}

			score += testcase.score * policy.score;
			status.AC++;
			return {
				status: "AC",
				cost: c,
				memory: m,
			};
		});
	});

	await db
		.updateTable("Submission")
		.set({
			status: (Object.entries(status).find(([, v]) => v > 0)?.[0] as any) || "AC",
			score,
			cost,
			memory,
			details: JSON.stringify(details),
		})
		.where("id", "=", payload.sub)
		.execute();

	return json({ ok: true });
};
