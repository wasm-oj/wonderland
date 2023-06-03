import { list_problems } from "$lib/server/problem";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ platform }) => {
	const problems = await list_problems(platform);

	return {
		problems,
	};
};
