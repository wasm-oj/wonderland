import { config } from "$lib/server/config";
import type { PageServerLoad } from "./$types";

export const load = (async () => {
	const cfg = await config();
	return {
		cfg: {
			compilers: cfg.compiler.length,
			runners: cfg.runner.length,
		},
	};
}) satisfies PageServerLoad;
