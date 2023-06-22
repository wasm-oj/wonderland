import type { RouteConfig } from "sveltekit-api";

export const Modifier = (r: RouteConfig) => {
	r.tags = ["Problem"];
	return r;
};
