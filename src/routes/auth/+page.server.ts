import { DB } from "$lib/server/sys/db";
import { sha256 } from "$lib/utils";
import debug from "debug";
import { verify, JWT } from "sveltekit-jwt";
import type { PageServerLoad } from "./$types";

const log = debug("app:auth");
log.enabled = true;

export const load = (async ({ url, cookies }) => {
	const token = url.searchParams.get("token");
	if (!token) {
		return { ok: false };
	}

	const ok = await verify(token);
	log("token verified", ok);
	const { payload } = JWT.decode(token);

	if (!ok || !payload.sub) {
		return { ok: false };
	}

	cookies.set("token", token, {
		path: "/",
		httpOnly: true,
		secure: true,
		sameSite: "strict",
		maxAge: 60 * 60 * 12,
	});

	const id = await sha256(payload.sub);

	const db = DB();
	const result = await db
		.insertInto("User")
		.values({
			id,
			name: payload.sub.split("@")[0],
			email: payload.sub,
			bio: "",
			avatar: "",
		})
		.onConflict((oc) => oc.column("id").doNothing())
		.executeTakeFirst();

	if (result.numInsertedOrUpdatedRows === 0n) {
		log("existing user", id);
	} else {
		log("new user", id);
	}

	return { ok: true };
}) satisfies PageServerLoad;
