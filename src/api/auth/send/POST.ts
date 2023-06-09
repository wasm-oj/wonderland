import { config } from "$lib/server/config";
import { z, type RouteModifier } from "sveltekit-api";
import { error, type RequestEvent } from "@sveltejs/kit";
import { Modifier as _Modifier } from "../shared";

export const Input = z.object({
	email: z.string().email().min(1).max(128).describe("User's email address"),
	ttl: z.number().int().min(1).max(30).default(1).describe("Token's time to live in days"),
	device: z.boolean().default(false).describe("Whether the token is for device login"),
});

export const Output = z.object({
	ok: z.boolean().describe("Whether the email was sent successfully, always true"),
	send: z.string().datetime().describe("Time when the email was sent"),
});

export const Error = {
	502: error(502, "Failed to send email"),
};

export const Modifier: RouteModifier = (r) => {
	_Modifier(r);
	r.operationId = "login";
	return r;
};

export default async function (
	input: z.infer<typeof Input>,
	evt: RequestEvent,
): Promise<z.infer<typeof Output>> {
	const cfg = await config();
	const url = new URL(cfg.app.pea);
	url.pathname = `/api${url.pathname}/login`;

	const res = await fetch(url.toString(), {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"User-Agent": evt.url.origin,
		},
		body: JSON.stringify({
			email: input.email,
			callback: evt.url.origin + (input.device ? "/auth/device" : "/auth"),
			ttl: input.ttl * 24 * 60,
		}),
	});

	if (!res.ok) {
		console.error(await res.text());
		throw Error[502];
	}

	return {
		ok: true,
		send: new Date().toISOString(),
	};
}
