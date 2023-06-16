import { load2api } from "$lib/server/load2api";
import { load } from "$routes/submission/+page.server";
import type { RequestHandler } from "./$types";

export const GET = (async (evt) => {
	return load2api("/submission", load, evt);
}) satisfies RequestHandler;
