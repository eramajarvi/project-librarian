import type { APIRoute } from "astro";
import { turso } from "../../lib/turso";

// export const GET: APIRoute = async () => {
// 	const result = await turso.execute("SELECT * FROM folders where userId = 1");
// 	return new Response(JSON.stringify(result.rows), {
// 		headers: { "Content-Type": "application/json" },
// 	});
// };
