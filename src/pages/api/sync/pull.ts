// src/pages/api/sync/pull.ts
import type { APIRoute, APIContext } from "astro";
import { createClient, type Client as TursoClient, type Row } from "@libsql/client";
// Import client types for mapping response
import type { Folder as ClientFolder, Bookmark as ClientBookmark } from "../../../lib/dexie";

// --- Turso Client Initialization ---
const tursoDBUrl = import.meta.env.TURSO_DATABASE_URL;
const tursoAuthToken = import.meta.env.TURSO_AUTH_TOKEN;

if (!tursoDBUrl) console.error("PULL API: TURSO_DATABASE_URL is not set!");
if (!tursoAuthToken && !tursoDBUrl?.startsWith("file:")) console.error("PULL API: TURSO_AUTH_TOKEN is not set!");

let turso: TursoClient;
try {
	turso = createClient({
		url: tursoDBUrl!,
		authToken: tursoAuthToken,
	});
	console.log("Turso client initialized for pull API.");
} catch (e) {
	console.error("Pull API: Failed to initialize Turso client:", e);
}

// Helper function to map server folder row to client folder structure
function mapServerFolderToClient(serverFolder: Row): ClientFolder {
	return {
		folder_id: serverFolder.client_folder_id as string, // client_folder_id from server
		server_id: serverFolder.id as number, // server's auto-increment PK
		user_id: serverFolder.user_id as string,
		folder_name: serverFolder.name as string, // 'name' from server
		folder_emoji: serverFolder.emoji as string, // 'emoji' from server
		created_at: Number(serverFolder.created_at), // Ensure it's a number
		updated_at: Number(serverFolder.updated_at), // Ensure it's a number
		sync_status: "synced", // Records from server are considered synced
		is_deleted: serverFolder.is_deleted === 1 || Boolean(serverFolder.is_deleted), // Handle soft delete flag
	};
}

// Helper function to map server bookmark row to client bookmark structure
function mapServerBookmarkToClient(serverBookmark: Row): ClientBookmark {
	return {
		bookmark_id: serverBookmark.bookmark_id as string, // PK is same
		user_id: serverBookmark.user_id as string,
		folder_id: serverBookmark.folder_id as string, // This is the client_folder_id of the parent
		url: serverBookmark.url as string,
		title: serverBookmark.title as string,
		created_at: Number(serverBookmark.created_at),
		updated_at: Number(serverBookmark.updated_at),
		sync_status: "synced",
		is_deleted: serverBookmark.is_deleted === 1 || Boolean(serverBookmark.is_deleted),
	};
}

export const GET: APIRoute = async (context: APIContext) => {
	if (!turso) {
		console.error("Pull API: Turso client not initialized.");
		return new Response(JSON.stringify({ error: "Database service unavailable" }), { status: 503 });
	}

	const { userId } = context.locals.auth();
	if (!userId) {
		console.log("Pull API: Unauthorized - No userId.");
		return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
	}

	const url = new URL(context.request.url);
	const lastSyncFolders = parseInt(url.searchParams.get("folders_last_sync") || "0");
	const lastSyncBookmarks = parseInt(url.searchParams.get("bookmarks_last_sync") || "0");

	// IMPORTANT: Capture this timestamp *before* making DB queries.
	// This will be the timestamp the client uses for its *next* pull request.
	const serverResponseTimestamp = Date.now();

	try {
		console.log(
			`Pull API: User ${userId} requesting changes since folders: ${lastSyncFolders}, bookmarks: ${lastSyncBookmarks}`
		);

		// Fetch active (not soft-deleted) folders modified since last sync
		const activeFoldersRs = await turso.execute({
			sql: "SELECT * FROM folders WHERE user_id = ? AND updated_at > ? AND (is_deleted = 0 OR is_deleted IS NULL)",
			args: [userId, lastSyncFolders],
		});
		const clientFolders = activeFoldersRs.rows.map(mapServerFolderToClient);

		// Fetch active (not soft-deleted) bookmarks modified since last sync
		const activeBookmarksRs = await turso.execute({
			sql: "SELECT * FROM bookmarks WHERE user_id = ? AND updated_at > ? AND (is_deleted = 0 OR is_deleted IS NULL)",
			args: [userId, lastSyncBookmarks],
		});
		const clientBookmarks = activeBookmarksRs.rows.map(mapServerBookmarkToClient);

		// Fetch IDs of folders that were soft-deleted on the server since last sync
		const deletedFolderIdsRs = await turso.execute({
			sql: "SELECT id FROM folders WHERE user_id = ? AND is_deleted = 1 AND updated_at > ?", // or use deleted_at > ?
			args: [userId, lastSyncFolders],
		});
		const deletedClientFolderIds = deletedFolderIdsRs.rows.map((row) => row.id as number); // These are server_ids

		// Fetch IDs of bookmarks that were soft-deleted on the server since last sync
		const deletedBookmarkIdsRs = await turso.execute({
			sql: "SELECT bookmark_id FROM bookmarks WHERE user_id = ? AND is_deleted = 1 AND updated_at > ?", // or use deleted_at > ?
			args: [userId, lastSyncBookmarks],
		});
		const deletedClientBookmarkIds = deletedBookmarkIdsRs.rows.map((row) => row.bookmark_id as string);

		console.log(`Pull API: Found ${clientFolders.length} active folders, ${clientBookmarks.length} active bookmarks.`);
		console.log(
			`Pull API: Found ${deletedClientFolderIds.length} deleted folders, ${deletedClientBookmarkIds.length} deleted bookmarks.`
		);

		return new Response(
			JSON.stringify({
				folders: clientFolders,
				bookmarks: clientBookmarks,
				deleted_folders_ids: deletedClientFolderIds, // Array of server_id (numbers) for folders
				deleted_bookmarks_ids: deletedClientBookmarkIds, // Array of bookmark_id (strings)
				server_current_timestamp: serverResponseTimestamp,
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (error: any) {
		console.error("Pull API - Error for user", userId, ":", error);
		return new Response(JSON.stringify({ error: `Sync pull failed: ${error.message || "Unknown server error"}` }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};
