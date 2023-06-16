import { list_problems } from "$lib/server/problem";
import type { PageServerLoad } from "./$types";

export const load = (async ({ platform }) => {
	const problems = await list_problems(platform);

	return {
		problems,
	};
}) satisfies PageServerLoad;
