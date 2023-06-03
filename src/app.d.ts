import { TokenSchema } from "$lib/token";
import { z } from "zod";
import type { CacheStorage, EventContext } from "@cloudflare/workers-types";

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			token?: z.infer<typeof TokenSchema>;
		}
		// interface PageData {}
		interface Platform {
			caches?: CacheStorage;
			context?: EventContext;
		}
	}
}

export {};
