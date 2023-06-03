import { building } from "$app/environment";
import { Kysely } from "kysely";

export class UnimplementedDB<Schema> extends Kysely<Schema> {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	constructor() {
		if (!building) {
			throw new Error("Unimplemented");
		}
		super({
			dialect: {
				createAdapter: () => ({}),
				createDriver: () => ({}),
				createIntrospector: () => ({}),
				createQueryCompiler: () => ({}),
			},
		} as never);
	}
}
