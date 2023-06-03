import { fetch_problem } from "$lib/server/problem";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ platform, params }) => {
	const problem = await fetch_problem(params.id, platform);

	return {
		problem,
	};
};
