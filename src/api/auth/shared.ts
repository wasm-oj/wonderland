import type { RouteModifier } from "sveltekit-api";

export const Modifier: RouteModifier = (r) => {
	r.tags = ["Auth"];
	return r;
};
