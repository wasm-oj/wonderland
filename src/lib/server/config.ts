import { building } from "$app/environment";
import { z } from "zod";
import { KV } from "./sys/kv";

export interface CompilerConfig {
	/** The location of the compiler (remote) */
	remote: string;
	/** The token for the remote compiler */
	token: string;
}

export interface RunnerConfig {
	/** The location of the runner (remote) */
	remote: string;
	/** The token for the remote runner */
	token: string;
	/**
	 * Wait for the runner to finish, disable callback machanism.
	 * This is useful for some serverless runners that stop the process after the request is finished
	 */
	wait?: boolean;
}

export interface ProblemBoxConfig {
	/** The remote repository of the problem box */
	remote?: string;
	/** The username for the remote repository (if needed) */
	username?: string;
	/** The password (or token) for the remote repository (if needed) */
	password?: string;
}

export interface AppConfig {
	/** The PEA endpoint for login */
	pea: string;
	/** The secret to sign runner callback */
	secret: string;
}

export interface Config {
	compiler: CompilerConfig[];
	runner: RunnerConfig[];
	problem: ProblemBoxConfig;
	app: AppConfig;
}

const CompilerConfigSchema = z.object({
	remote: z.string().url(),
	token: z.string(),
});

const RunnerConfigSchema = z.object({
	remote: z.string().url(),
	token: z.string(),
	wait: z.boolean().optional(),
});

const ProblemBoxConfigSchema = z.object({
	remote: z.string().optional(),
	username: z.string().optional(),
	password: z.string().optional(),
});

const AppConfigSchema = z.object({
	pea: z.string().url(),
	secret: z.string().default("WASM_OJ_WONDERLAND"),
});

export const ConfigSchema = z.object({
	compiler: z.array(CompilerConfigSchema),
	runner: z.array(RunnerConfigSchema),
	problem: ProblemBoxConfigSchema,
	app: AppConfigSchema,
});

let _config: Promise<Config> | undefined = undefined;

/**
 * Get the config object
 * @throws If the config is not set
 * @returns The config object
 */
export async function config(): Promise<Config> {
	if (building) {
		return {
			compiler: [],
			runner: [],
			problem: {},
			app: { pea: "https://pea.csie.cool/app/wasm-oj", secret: "WASM_OJ_WONDERLAND" },
		};
	}

	if (_config) {
		return _config;
	}

	_config = (async () => {
		const config_raw = await KV().get("app:config");

		if (!config_raw) {
			throw new Error("No Config, please set config");
		}

		const config = ConfigSchema.parse(JSON.parse(config_raw));

		return config;
	})();

	return await _config;
}

/**
 * Invalidate the config cache, so that the next call to config() will fetch the config from KV
 */
export function invalidate() {
	_config = undefined;
}
