import { building, dev } from "$app/environment";
import { env } from "$env/dynamic/private";
import { z } from "zod";
import { KV } from "./sys/kv";

export interface CompilerConfig {
	/** The location of the compiler (remote) */
	remote?: string;
	/** The token for the remote compiler */
	token?: string;
}

export interface RunnerConfig {
	/** The location of the runner (remote) */
	remote?: string;
	/** The token for the remote runner */
	token?: string;
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
	/** The secret for signing and verifying JWT */
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
	remote: z.string().url(),
	username: z.string().optional(),
	password: z.string().optional(),
});

const AppConfigSchema = z.object({
	secret: z.string(),
});

const ConfigSchema = z.object({
	compiler: z.array(CompilerConfigSchema),
	runner: z.array(RunnerConfigSchema),
	problem: ProblemBoxConfigSchema,
	app: AppConfigSchema,
});

let _config: Promise<Config> | undefined = undefined;

export async function config(): Promise<Config> {
	if (building) {
		return { compiler: [], runner: [], problem: {}, app: { secret: "" } };
	}

	if (_config) {
		return _config;
	}

	_config = (async () => {
		const config_raw = await KV().get("app:config");

		if (!config_raw) {
			if (dev) {
				return {
					compiler: [],
					runner: [],
					problem: { remote: "wasm-oj/problem-box" },
					app: { secret: env.APP_SECRET || "wow" },
				};
			}

			throw new Error("No Config, please set config");
		}

		const config = ConfigSchema.parse(JSON.parse(config_raw));

		return config;
	})();

	return _config;
}
