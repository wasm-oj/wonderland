import { ConfigSchema, config, invalidate } from "$lib/server/config";
import { only_admin } from "$lib/server/permission";
import { KV } from "$lib/server/sys/kv";
import { superValidate } from "sveltekit-superforms/server";
import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load = (async ({ locals }) => {
	const cfg = await config().catch(() => null);
	if (cfg) {
		only_admin(locals);
	}

	const form = await superValidate(
		cfg || {
			compiler: [],
			runner: [],
			problem: {
				remote: "wasm-oj/problem-box",
			},
			app: { pea: "https://pea.csie.cool/app/wasm-oj", secret: "WASM_OJ_WONDERLAND" },
		},
		ConfigSchema,
	);

	return { form };
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ request, locals }) => {
		const cfg = await config().catch(() => null);
		if (cfg) {
			only_admin(locals);
		}

		const form = await superValidate(request, ConfigSchema);

		if (!form.valid) {
			throw error(400, "Invalid");
		}

		const kv = KV();
		await kv.set("app:config", JSON.stringify(form.data));
		invalidate();

		throw redirect(302, "/");
	},
} satisfies Actions;
