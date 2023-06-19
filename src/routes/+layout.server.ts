import api from "$api";
import * as route from "$api/me/GET";
import type { LayoutServerLoad } from "./$types";

export const load = (async (evt) => {
	const inputs = await api.parse(route, evt);
	return route.default(inputs, evt);
}) satisfies LayoutServerLoad;
