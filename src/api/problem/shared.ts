import type { RouteModifier } from "sveltekit-api";

export const Modifier: RouteModifier = (r) => {
	r.tags = ["Problem"];
	return r;
};
