import { config, type CompilerConfig } from "$lib/server/config";
import { DB } from "$lib/server/sys/db";
import debug from "debug";
import { JWT } from "sveltekit-jwt";
import { error } from "@sveltejs/kit";
import { fetch_problem, fetch_problem_specs } from "../problem";

export async function submit(
	problem_id: string,
	lang: string,
	code: string,
	origin: string,
	submitter_id: string,
): Promise<string> {
	const submission_id = generate_submission_id();
	const db = DB();
	const log = debug(`submission:submit:${submission_id}`);
	log.enabled = true;

	const cfg = await config();

	if (cfg.compiler.length === 0) {
		throw error(500, "no compiler configured");
	}

	const compiler = cfg.compiler[Math.floor(Math.random() * cfg.compiler.length)];
	log("selected compiler", compiler);

	if (cfg.runner.length === 0) {
		throw error(500, "no runner configured");
	}

	const runner = cfg.runner[Math.floor(Math.random() * cfg.runner.length)];
	log("selected runner", runner);

	const specs_p = fetch_problem_specs(problem_id);

	const { wasm, version: compiler_version } = await compile(compiler, code, lang).catch((err) => {
		log("compilation failed", err);
		throw err;
	});

	const { specs } = await specs_p;
	log("fetched specs", specs);

	const callback = runner.wait
		? null
		: new URL(
				`/api/judge/callback/${await JWT.sign(
					{ sub: submission_id, problem: problem_id },
					cfg.app.secret,
				)}`,
				origin,
		  ).href;
	log("callback URL", callback);

	const res = await fetch(new URL("judge", runner.remote), {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			...(runner.token && { Authorization: `Bearer ${runner.token}` }),
		},
		body: JSON.stringify({
			wasm,
			specs,
			callback,
		}),
	});

	if (!res.ok) {
		log("judge failed", res.status);
		throw error(res.status, await res.text());
	}

	const runner_version = res.headers.get("X-Version") || "";

	const result = await res.json<{
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
	if (result.error) {
		log("judge failed", result.error);
		throw error(500, result.error);
	}

	await db
		.insertInto("Submission")
		.values({
			id: submission_id,
			runner_version,
			compiler_version,
			submitter_id,
			problem_id,
			code,
			code_lang: lang,
			status: "running",
		})
		.execute();

	if (runner.wait) {
		await finalize_submission(submission_id, problem_id, result);
	}

	return submission_id;
}

export function generate_submission_id(): string {
	let id = Date.now().toString(36);

	while (id.length < 16) {
		id += Math.random().toString(36).slice(2);
	}

	return id.slice(0, 16);
}

export async function compile(
	compiler: CompilerConfig,
	code: string,
	lang: string,
): Promise<{ wasm: string; version: string }> {
	const res = await fetch(new URL("compile", compiler.remote), {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			...(compiler.token && { Authorization: `Bearer ${compiler.token}` }),
		},
		body: JSON.stringify({ lang, code }),
	});

	const version = res.headers.get("X-Version") || "";

	const { success, wasm, message } = await res.json<{
		success: boolean;
		message: string;
		hash: string;
		wasm: string;
	}>();

	if (!success) {
		throw error(400, message);
	}

	return { wasm, version };
}

export async function finalize_submission(
	submission_id: string,
	problem_id: string,
	result: {
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
	},
) {
	const problem = await fetch_problem(problem_id);

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

	const db = DB();

	await db
		.updateTable("Submission")
		.set({
			status: (Object.entries(status).find(([, v]) => v > 0)?.[0] as any) || "AC",
			score,
			cost,
			memory,
			details: JSON.stringify(details),
		})
		.where("id", "=", submission_id)
		.execute();
}
