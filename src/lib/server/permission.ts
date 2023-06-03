import { error } from "@sveltejs/kit";

export function only_admin(locals: App.Locals): void {
	if (!locals.token) {
		throw error(401, "Unauthorized");
	}

	if (!locals.token.admin) {
		throw error(403, "Forbidden");
	}
}
