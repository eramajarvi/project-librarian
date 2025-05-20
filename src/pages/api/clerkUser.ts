import type { APIContext } from "astro";
import { clerkClient } from "@clerk/astro/server";

export async function getAuthUser(context: APIContext) {
	const { userId, redirectToSignIn } = context.locals.auth();

	if (!userId) return { redirect: redirectToSignIn() };

	const user = await clerkClient(context).users.getUser(userId);
	return { userId, user };
}
