import api from "$api";
import * as route from "$api/submission/POST";
import { superValidate } from "sveltekit-superforms/server";
import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load = (async () => {
	const form = await superValidate(route.Input.omit({ problem: true }));

	return { form };
}) satisfies PageServerLoad;

export const actions = {
	default: async (evt) => {
		const inputs = await api.parse(route, evt, {
			fallback: {
				body: {
					problem: evt.params.id,
				},
			},
		});
		const { submission_id } = await route.default(inputs, evt);
		throw redirect(302, `/submission/${submission_id}`);
	},
} satisfies Actions;
