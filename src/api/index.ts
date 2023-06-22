import { API } from "sveltekit-api";
import { version, author } from "../../package.json";

const api = new API(
	import.meta.glob("./**/*.ts"),
	{
		openapi: "3.0.0",
		info: {
			title: "WASM OJ Wonderland API",
			version: version,
			description: "You can interact with WASM OJ Wonderland through this API",
			license: {
				name: "MIT",
				url: "https://github.com/wasm-oj/wonderland/blob/main/LICENSE",
			},
			contact: author,
		},
		externalDocs: {
			url: "https://github.com/wasm-oj/wonderland",
		},
		servers: [
			{
				url: "{protocol}://{host}",
				variables: {
					protocol: {
						default: "https",
						enum: ["http", "https"],
					},
					host: {
						default: "woj.csie.cool",
					},
				},
			},
		],
	},
	"/api",
	(r) => {
		r.registerComponent("securitySchemes", "bearerAuth", {
			type: "http",
			scheme: "bearer",
			bearerFormat: "JWT",
			description:
				"WASM OJ Wonderland uses PEA (https://pea.csie.cool) to authenticate users.",
		});
	},
);

export default api;
