import { config } from "$lib/server/config";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
	const cfg = await config();
	return {
		cfg: {
			compilers: cfg.compiler.length,
			runners: cfg.runner.length,
		},
	};
};
