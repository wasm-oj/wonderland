import { only_admin } from "$lib/server/permission";
import { DB } from "$lib/server/sys/db";
import { down, up } from "$lib/server/sys/db/migration";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET = (async ({ params, locals }) => {
	only_admin(locals);

	const db = DB();

	try {
		if (params.action === "up") {
			await up(db);
			return json({ ok: true });
		} else if (params.action === "down") {
			await down(db);
			return json({ ok: true });
		}
	} catch (err) {
		console.error(err);
		throw error(500, "Something went wrong");
	}

	throw error(404, "Not found");
}) satisfies RequestHandler;
