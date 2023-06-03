import { config } from "$lib/server/config";
import { TokenSchema } from "$lib/token";
import debug from "debug";
import { locale, waitLocale } from "svelte-i18n";
import { checkout } from "sveltekit-jwt";
import type { Handle, RequestEvent } from "@sveltejs/kit";

const log = debug("app");

export const handle: Handle = async ({ event, resolve }) => {
	try {
		await config();
	} catch {
		return new Response("Setup not complete, no config found", { status: 500 });
	}

	const start = Date.now();

	await set_lang(event);

	const token = await checkout(event, (await config()).app.secret);
	if (token) {
		console.log("token", token);
		event.locals.token = TokenSchema.parse(token);
	}

	const result = await resolve(event);

	const duration = Date.now() - start;
	log(`${event.request.method} ${event.request.url} [${result.status}] ${duration}ms`);

	return result;
};

async function set_lang(event: RequestEvent) {
	const lang = event.request.headers.get("accept-language")?.split(",")[0] || "en";
	locale.set(lang);
	await waitLocale(lang);
}
