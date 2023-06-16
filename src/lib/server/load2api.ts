import debug from "debug";
import type { RequestEvent, ServerLoadEvent } from "@sveltejs/kit";
import { json } from "@sveltejs/kit";

const log = debug("load2api");
log.enabled = true;

export async function load2api<Evt extends RequestEvent, RouteID extends string | null, Returns>(
	id: RouteID,
	load: (evt: ServerLoadEvent<never, never, RouteID>) => Returns,
	evt: Evt,
) {
	const loader = {
		...evt,
		route: { id },
		depends: () => undefined,
		parent: async () => ({} as never),
	};

	log(evt.route.id, "=>", id);

	return json(await load(loader as never));
}
