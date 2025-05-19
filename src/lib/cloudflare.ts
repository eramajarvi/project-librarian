import Cloudflare from "cloudflare";

export const client = new Cloudflare({
	apiToken: import.meta.env.CLOUDFLARE_API_TOKEN,
});
