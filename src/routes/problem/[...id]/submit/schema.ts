import { z } from "zod";

export const schema = z.object({
	lang: z.enum(["Rust", "C", "C++"]),
	code: z
		.string()
		.min(1)
		.max(16 * 1024),
});
