import { config } from "$lib/server/config";
import type { LayoutServerLoad } from "./$types";

export const load = (async ({ locals }) => {
	return {
		token: locals.token,
		pea: (await config()).app.pea,
	};
}) satisfies LayoutServerLoad;
