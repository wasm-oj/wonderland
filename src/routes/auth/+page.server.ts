import { config } from "$lib/server/config";
import { JWT } from "sveltekit-jwt";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url, cookies }) => {
	const token = url.searchParams.get("token");
	const cfg = await config();
	if (token) {
		const ok = await JWT.verify(token, cfg.app.secret);

		if (!ok) {
			return { ok: false };
		}

		cookies.set("token", token, {
			path: "/",
			httpOnly: true,
			secure: true,
			sameSite: "strict",
			maxAge: 60 * 60 * 12,
		});

		return { ok: true };
	} else {
		return { ok: false };
	}
};
