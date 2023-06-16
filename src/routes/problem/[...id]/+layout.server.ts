import { fetch_problem } from "$lib/server/problem";
import type { LayoutServerLoad } from "./$types";

export const load = (async ({ platform, params }) => {
	const problem = await fetch_problem(params.id, platform);

	return {
		problem,
	};
}) satisfies LayoutServerLoad;
