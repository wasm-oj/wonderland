import { z } from "zod";

export const TokenSchema = z.object({
	exp: z.number(),
	sub: z.string().email().max(255),
	admin: z.boolean().optional(),
});
