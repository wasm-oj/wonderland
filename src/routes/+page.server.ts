import * as route from "$api/sys/GET";
import type { PageServerLoad } from "./$types";

export const load = (async () => {
	return route.default({});
}) satisfies PageServerLoad;
