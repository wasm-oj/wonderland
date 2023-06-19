import api from "$api";
import * as route from "$api/auth/GET";
import type { PageServerLoad } from "./$types";

export const load = (async (evt) => {
	const inputs = await api.parse(route, evt);
	return route.default(inputs, evt);
}) satisfies PageServerLoad;
