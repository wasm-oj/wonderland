import { submit } from "$lib/server/submission";
import { sha256 } from "$lib/utils";
import { z } from "sveltekit-api";
import type { RouteModifier } from "sveltekit-api";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "@sveltejs/kit";
import { Modifier as _Modifier } from "./shared";

export const Input = z.object({
	problem: z.string().min(1).max(128).describe("Problem ID"),
	code: z
		.string()
		.min(1)
		.max(16 * 1024)
		.describe("Source code"),
	lang: z.enum(["rs", "c", "cpp"]).describe("Programming language of the source code"),
});

export const Output = z.object({
	submission_id: z.string().describe("Submission ID"),
});

export const Error = {
	400: error(400, "Bad Request"),
	401: error(401, "Unauthorized"),
};

export const Modifier: RouteModifier = (r) => {
	_Modifier(r);
	r.security = [{ bearerAuth: [] }];
	r.operationId = "submit";
	return r;
};

export default async function (
	input: z.infer<typeof Input>,
	evt: RequestEvent,
): Promise<z.infer<typeof Output>> {
	if (!evt.locals.token) {
		throw Error[401];
	}

	const origin = evt.request.headers.get("origin");
	if (!origin) {
		throw Error[400];
	}

	const submission_p = submit(
		input.problem,
		input.lang,
		input.code,
		origin,
		await sha256(evt.locals.token.sub),
	);

	if (evt.platform?.context?.waitUntil) {
		evt.platform.context.waitUntil(submission_p);
	}

	const submission_id = await submission_p;

	return {
		submission_id,
	};
}
