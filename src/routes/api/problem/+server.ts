import { load2api } from "$lib/server/load2api";
import { load } from "$routes/problem/+page.server";
import type { RequestHandler } from "./$types";

export const GET = (async (evt) => {
	return load2api("/problem", load, evt);
}) satisfies RequestHandler;
