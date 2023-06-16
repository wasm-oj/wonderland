import { load2api } from "$lib/server/load2api";
import { load } from "$routes/submission/[...id]/+page.server";
import type { RequestHandler } from "./$types";

export const GET = (async (evt) => {
	return load2api("/submission/[...id]", load, evt);
}) satisfies RequestHandler;
