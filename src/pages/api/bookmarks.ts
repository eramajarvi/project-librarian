import type { APIRoute } from "astro";
import { turso } from "../../lib/turso";

// export const GET: APIRoute = async () => {
// 	const result = await turso.execute("SELECT * FROM bookmarks");
// 	return new Response(JSON.stringify(result.rows), {
// 		headers: { "Content-Type": "application/json" },
// 	});
// };

// export const POST: APIRoute = async ({ request }) => {
// 	const data = await request.json();

// 	// Basic validation
// 	if (!data.id || !data.url) {
// 		return new Response("Invalid", { status: 400 });
// 	}

// 	await turso.execute({
// 		sql: `INSERT OR REPLACE INTO bookmarks (id, url, title, createdAt) VALUES (?, ?, ?, ?)`,
// 		args: [data.id, data.url, data.title, data.createdAt],
// 	});

// 	return new Response("OK");
// };
