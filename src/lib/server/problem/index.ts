import { CACHE } from "$lib/server/sys/cache";
import debug from "debug";
// @ts-expect-error missing types
import TOMLParser from "@iarna/toml/lib/toml-parser";
import { config } from "../config";
import type { Problem, ProblemSpecs } from "./types";

const log = debug("app:problem");

export async function fetch_problem(problem_id: string, platform?: App.Platform): Promise<Problem> {
	const cfg = await config();

	if (!cfg.problem.remote) {
		throw new Error("problem.remote is not defined");
	}

	// parse github url or owner/repo from cfg.problem.remote
	let owner: string, repo: string;
	try {
		const url = new URL(cfg.problem.remote);
		owner = url.pathname.split("/")[1];
		repo = url.pathname.split("/")[2];
	} catch {
		[owner, repo] = cfg.problem.remote.split("/");
	}

	if (!owner || !repo) {
		throw new Error("problem.remote is not valid");
	}

	const cache = CACHE(platform);
	const key = `https://github.com/${owner}/${repo}/tree/main/problem/${problem_id}/problem.toml`;
	const cached = await cache.match(key).catch((err) => {
		console.error("cache match error", err);
		return undefined;
	});

	let res: Response;
	if (cached) {
		log("cache hit", key);
		res = cached;
	} else if (cfg.problem.password) {
		res = await fetch(
			`https://api.github.com/repos/${owner}/${repo}/contents/problem/${problem_id}/problem.toml`,
			{
				headers: {
					Authorization: `Bearer ${cfg.problem.password}`,
					Accept: "application/vnd.github.raw",
				},
			},
		);
	} else {
		res = await fetch(
			`https://raw.githubusercontent.com/${owner}/${repo}/main/problem/${problem_id}/problem.toml`,
		);
	}

	if (!res.ok) {
		throw new Error("problem not found");
	}

	if (!cached) {
		res = new Response(res.body, res);
		res.headers.set("Cache-Control", "max-age=600");
		await cache.put(key, res.clone());
	}

	const problem_toml = await res.text();

	const parser = new TOMLParser();
	parser.parse(problem_toml);
	const problem = parser.finish();

	return JSON.parse(JSON.stringify(problem));
}

export async function fetch_problem_specs(
	problem_id: string,
	platform?: App.Platform,
): Promise<ProblemSpecs> {
	const cfg = await config();

	if (!cfg.problem.remote) {
		throw new Error("problem.remote is not defined");
	}

	// parse github url or owner/repo from cfg.problem.remote
	let owner: string, repo: string;
	try {
		const url = new URL(cfg.problem.remote);
		owner = url.pathname.split("/")[1];
		repo = url.pathname.split("/")[2];
	} catch {
		[owner, repo] = cfg.problem.remote.split("/");
	}

	if (!owner || !repo) {
		throw new Error("problem.remote is not valid");
	}

	const cache = CACHE(platform);
	const key = `https://github.com/${owner}/${repo}/tree/main/spec/${problem_id}/specs.json`;
	const cached = await cache.match(key).catch((err) => {
		console.error("cache match error", err);
		return undefined;
	});

	let res: Response;
	let base_url: string | undefined;
	if (cached) {
		log("cache hit", key);
		res = cached;
		if (cfg.problem.password) {
			base_url = `https://api.github.com/repos/${owner}/${repo}/contents/problem/${problem_id}/`;
		} else {
			base_url = `https://raw.githubusercontent.com/${owner}/${repo}/main/problem/${problem_id}/`;
		}
	} else if (cfg.problem.password) {
		base_url = `https://api.github.com/repos/${owner}/${repo}/contents/problem/${problem_id}/`;
		res = await fetch(
			`https://api.github.com/repos/${owner}/${repo}/contents/spec/${problem_id}/specs.json`,
			{
				headers: {
					Authorization: `Bearer ${cfg.problem.password}`,
					Accept: "application/vnd.github.raw",
				},
			},
		);
	} else {
		base_url = `https://raw.githubusercontent.com/${owner}/${repo}/main/problem/${problem_id}/`;
		res = await fetch(
			`https://raw.githubusercontent.com/${owner}/${repo}/main/spec/${problem_id}/specs.json`,
		);
	}

	if (!res.ok) {
		throw new Error("problem not found");
	}

	if (!cached) {
		res = new Response(res.body, res);
		res.headers.set("Cache-Control", "max-age=600");
		await cache.put(key, res.clone());
	}

	const specs = await res.json<ProblemSpecs>();

	if (base_url) {
		for (const spec of specs.specs) {
			for (const key in spec) {
				if (key.endsWith("url") && typeof spec[key] === "string") {
					spec[key] = new URL(spec[key] as string, base_url).href;
				}
			}
		}
	}

	return specs;
}

export * from "./types";

export async function list_problems(
	platform?: App.Platform,
): Promise<{ id: string; name: string; tags: string[] }[]> {
	const cfg = await config();

	if (!cfg.problem.remote) {
		throw new Error("problem.remote is not defined");
	}

	// parse github url or owner/repo from cfg.problem.remote
	let owner: string, repo: string;
	try {
		const url = new URL(cfg.problem.remote);
		owner = url.pathname.split("/")[1];
		repo = url.pathname.split("/")[2];
	} catch {
		[owner, repo] = cfg.problem.remote.split("/");
	}

	if (!owner || !repo) {
		throw new Error("problem.remote is not valid");
	}

	const cache = CACHE(platform);
	const key = `https://github.com/${owner}/${repo}/tree/main/spec/index.json`;
	const cached = await cache.match(key).catch((err) => {
		console.error("cache match error", err);
		return undefined;
	});

	let res: Response;
	if (cached) {
		log("cache hit", key);
		res = cached;
	} else if (cfg.problem.password) {
		res = await fetch(
			`https://api.github.com/repos/${owner}/${repo}/contents/spec/index.json`,
			{
				headers: {
					Authorization: `Bearer ${cfg.problem.password}`,
					Accept: "application/vnd.github.raw",
				},
			},
		);
	} else {
		res = await fetch(
			`https://raw.githubusercontent.com/${owner}/${repo}/main/spec/index.json`,
		);
	}

	if (!res.ok) {
		throw new Error("problem list not found");
	}

	if (!cached) {
		res = new Response(res.body, res);
		res.headers.set("Cache-Control", "max-age=600");
		await cache.put(key, res.clone());
	}

	const problem_list = await res.json<{ id: string; name: string; tags: string[] }[]>();
	return problem_list;
}

export * from "./types";
