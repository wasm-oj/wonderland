import type { RouteModifier } from "sveltekit-api";

export const Modifier: RouteModifier = (r) => {
	r.tags = ["Submission"];
	return r;
};
