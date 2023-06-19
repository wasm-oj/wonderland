import { config } from "$lib/server/config";
import { sha256 } from "$lib/utils";
import { z } from "sveltekit-api";
import type { RequestEvent } from "@sveltejs/kit";

export const Output = z.object({
	id: z.string().optional().describe("User ID"),
	email: z.string().optional().describe("User's email"),
	exp: z.number().optional().describe("Token expiration time, in seconds since epoch"),
	pea: z.string().describe("The PEA login URL that this app uses"),
});

export default async function (
	_: Record<never, never>,
	evt: RequestEvent,
): Promise<z.infer<typeof Output>> {
	const email = evt.locals.token?.sub;
	return {
		id: email ? await sha256(email) : undefined,
		email: email,
		exp: evt.locals.token?.exp,
		pea: (await config()).app.pea,
	};
}
