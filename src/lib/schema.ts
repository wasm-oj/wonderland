import { z } from "zod";

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
	secret: z.string(),
});

export const ConfigSchema = z.object({
	compiler: z.array(CompilerConfigSchema),
	runner: z.array(RunnerConfigSchema),
	problem: ProblemBoxConfigSchema,
	app: AppConfigSchema,
});
