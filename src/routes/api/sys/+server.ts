import api from "$api";
import type { RequestHandler } from "./$types";

export const GET = ((evt) => api.handle(evt)) satisfies RequestHandler;
