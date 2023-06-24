import { DB } from "$lib/server/sys/db";
import { sha256 } from "$lib/utils";
import debug from "debug";
import { z } from "sveltekit-api";
import type { RouteModifier } from "sveltekit-api";
import { JWT, verify } from "sveltekit-jwt";
import { error, type RequestEvent } from "@sveltejs/kit";
import { Modifier as _Modifier } from "./shared";

const log = debug("app:auth");
log.enabled = true;

export const Query = z.object({
	token: z.string().describe("The JWT sent to user's email by PEA"),
});

export const Output = z.object({
	ok: z.boolean().describe("Whether the token is valid"),
	new: z.boolean().describe("Whether the user is new"),
});

export const Error = {
	400: error(400, "Token is invalid"),
};

export const Modifier: RouteModifier = (r) => {
	_Modifier(r);
	r.operationId = "auth";
	return r;
};

export default async function (
	query: z.infer<typeof Query>,
	{ cookies }: RequestEvent,
): Promise<z.infer<typeof Output>> {
	const token = query.token;

	const ok = await verify(token);
	log("token verified", ok);
	const { payload } = JWT.decode(token);

	if (!ok || !payload.sub || !payload.exp || !payload.iat) {
		throw Error[400];
	}

	if (payload.exp - payload.iat > 60 * 60 * 24 * 30) {
		throw Error[400];
	}

	cookies.set("token", token, {
		path: "/",
		httpOnly: true,
		secure: true,
		sameSite: "strict",
		maxAge: payload.exp ? Math.floor(payload.exp - Date.now() / 1000) : undefined,
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

	return { ok: true, new: result.numInsertedOrUpdatedRows === 1n };
}
