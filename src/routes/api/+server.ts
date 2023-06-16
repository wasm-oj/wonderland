import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const prerender = true;

type Node = { [key: string]: Node | boolean };

export const GET = (async (evt) => {
	const routes = await Promise.all(
		Object.entries(
			import.meta.glob<boolean, string, Record<string, () => Promise<unknown>>>(
				"./**/*/+server.ts",
			),
		).map(([path, load]) => {
			return Promise.all([
				path.replace(/^\./, evt.url.pathname).replace("/+server.ts", ""),
				load().then((mod) =>
					Object.keys(mod).filter((key) =>
						key.match(/^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)$/),
					),
				),
			]);
		}),
	);

	const tree = routes.reduce((tree, route) => {
		const parts = route[0].split("/").filter(Boolean);
		let node = tree;
		for (let part of parts) {
			part = part.replace(/\[\.\.\.(.+)\]/, "[$1]");
			if (!node[part]) {
				node[part] = {};
			}
			const next = node[part];
			if (typeof next !== "boolean") {
				node = next;
			}
		}
		Object.assign(node, Object.fromEntries(route[1].map((method) => [method, true])));

		return tree;
	}, {} as Node);

	return json(tree);
}) satisfies RequestHandler;
