import type { APIRoute } from "astro";
import { client } from "../../lib/cloudflare";

const CLOUDFLARE_ACCOUNT_ID = import.meta.env.CLOUDFLARE_ACCOUNT_ID;

export const POST: APIRoute = async ({ request }) => {
	if (!client.apiToken || !CLOUDFLARE_ACCOUNT_ID) {
		return new Response(JSON.stringify({ error: "Missing API token or account ID" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		const body = await request.json();
		const targetUrl = body.url;

		if (!targetUrl || typeof targetUrl !== "string") {
			return new Response(JSON.stringify({ error: "Se requiere la URL en el cuerpo de la solicitud." }), {
				status: 400, // Bad Request
				headers: { "Content-Type": "application/json" },
			});
		}

		const result = await client.browserRendering.snapshot.create({
			account_id: CLOUDFLARE_ACCOUNT_ID,
			url: targetUrl,
			screenshotOptions: {
				type: "webp",
				quality: 60,
			},
			viewport: {
				width: 1280,
				height: 720,
				isLandscape: true,
				isMobile: false,
			},
			cacheTTL: 86400,
			userAgent:
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0",
		});

		const dataUrl = `data:image/webp;base64,${result.screenshot}`;

		// Return as JSON
		return new Response(JSON.stringify({ data: dataUrl }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error: any) {
		console.error(error);
		return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};
