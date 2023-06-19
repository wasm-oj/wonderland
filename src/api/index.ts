import { API } from "sveltekit-api";

const api = new API(
	import.meta.glob("./**/*.ts"),
	{
		openapi: "3.0.0",
		info: {
			title: "WASM OJ Wonderland API",
			version: "1.0.0",
			description: "You can interact with WASM OJ Wonderland through this API",
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
