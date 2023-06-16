import { submit } from "$lib/server/submission";
import { sha256 } from "$lib/utils";
import { superValidate } from "sveltekit-superforms/server";
import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { schema } from "./schema";

export const load = (async () => {
	const form = await superValidate(schema);

	return { form };
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ params, request, locals, platform }) => {
		if (!locals.token) {
			throw error(401, "Unauthorized");
		}

		const problem_id = params.id;

		const form = await superValidate(request, schema);
		console.log("POST", problem_id, form);

		if (!form.valid) {
			throw error(400, "Invalid form");
		}

		const lang =
			form.data.lang === "Rust"
				? "rs"
				: form.data.lang === "C++"
				? "cpp"
				: form.data.lang === "C"
				? "c"
				: "unknown";

		if (lang === "unknown") {
			throw error(400, "Unknown language");
		}

		const origin = request.headers.get("origin");
		if (!origin) {
			throw error(400, "Invalid origin");
		}

		const submission_p = submit(
			problem_id,
			lang,
			form.data.code,
			origin,
			await sha256(locals.token.sub),
		);

		if (platform?.context?.waitUntil) {
			platform.context.waitUntil(submission_p);
		}

		const submission_id = await submission_p;

		throw redirect(302, `/submission/${submission_id}`);
	},
} satisfies Actions;
