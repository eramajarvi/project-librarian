import { db, type Folder, type Bookmark } from "./dexie";

const API_BASE_URL = "/api/sync";

// --- Last Sync Timestamp Management ---
// We'll use localStorage for simplicity. A Dexie table 'sync_meta' could be more robust.
const LAST_SYNC_FOLDERS_KEY = "last_sync_timestamp_folders";
const LAST_SYNC_BOOKMARKS_KEY = "last_sync_timestamp_bookmarks";

interface ApiChangeItemDataFolder {
	// Fields expected by the server for a folder
	folder_id?: string; // Client's UUID (for create, or context in update/delete result)
	server_id?: number; // Server's PK (for update/delete actions)
	user_id: string;
	name: string; // Mapped from folder_name
	emoji: string; // Mapped from folder_emoji
	created_at?: number; // For create action
	updated_at: number; // For create/update actions
}

interface ApiChangeItemDataBookmark {
	// Fields expected by the server for a bookmark
	bookmark_id: string; // Client's UUID (also server PK)
	user_id: string;
	folder_id: string; // Client's UUID for the parent folder
	url: string;
	title: string;
	created_at?: number; // For create action
	updated_at: number; // For create/update actions
}

// Base data structures (can remain mostly the same or be refined)
interface BaseFolderData {
	user_id: string;
	folder_name: string; // Mapped from folder_name
	folder_emoji: string; // Mapped from folder_emoji
	updated_at: number;
}
interface BaseBookmarkData {
	user_id: string;
	folder_id: string; // Client's UUID for the parent folder
	url: string;
	title: string;
	updated_at: number;
}

// Specific Payloads for PUSH actions
interface CreateFolderPushData extends BaseFolderData {
	folder_id: string; // Client's UUID (for create, or context in update/delete result)
	created_at: number;
}
interface UpdateFolderPushData extends BaseFolderData {
	folder_id: string; // Client's UUID (for client to map response)
	server_id: number; // Server's PK (for update/delete actions)
}
interface DeleteFolderPushData {
	folder_id: string; // Client's UUID (for client to map response)
	server_id: number; // Server's PK
	user_id: string; // For validation on server
}

interface CreateBookmarkPushData extends BaseBookmarkData {
	bookmark_id: string; // Client's UUID (also server PK)
	created_at: number;
}
interface UpdateBookmarkPushData extends BaseBookmarkData {
	bookmark_id: string; // Client's UUID (also server PK)
}
interface DeleteBookmarkPushData {
	bookmark_id: string; // Client's UUID (also server PK)
	user_id: string; // For validation on server
}

// Discriminated Union for ApiChangeItem
type ApiChangeItem =
	| { table: "folders"; action: "create"; data: CreateFolderPushData }
	| { table: "folders"; action: "update"; data: UpdateFolderPushData }
	| { table: "folders"; action: "delete"; data: DeleteFolderPushData }
	| { table: "bookmarks"; action: "create"; data: CreateBookmarkPushData }
	| { table: "bookmarks"; action: "update"; data: UpdateBookmarkPushData }
	| { table: "bookmarks"; action: "delete"; data: DeleteBookmarkPushData };

// --- End Type definitions ---

async function getLastSyncTimestamp(tableKey: string): Promise<number> {
	const timestampStr = localStorage.getItem(tableKey);
	return timestampStr ? parseInt(timestampStr, 10) : 0;
}

async function setLastSyncTimestamp(tableKey: string, timestamp: number): Promise<void> {
	localStorage.setItem(tableKey, timestamp.toString());
}

// --- Push Local Changes to Server ---
async function pushChanges() {
	console.log("SYNC_SERVICE: Starting pushChanges...");
	let changesAttemptedCount = 0;
	let changesSuccessfullyProcessedCount = 0;

	const changesToPush: ApiChangeItem[] = [];

	// 1. Gather Folders
	const dirtyFolders = await db.folders.filter((f) => f.sync_status !== "synced").toArray();

	for (const folder of dirtyFolders) {
		changesAttemptedCount++;
		if (folder.sync_status === "new") {
			changesToPush.push({
				table: "folders",
				action: "create",
				data: {
					folder_id: folder.folder_id,
					user_id: folder.user_id,
					folder_name: folder.folder_name,
					folder_emoji: folder.folder_emoji,
					created_at: folder.created_at,
					updated_at: folder.updated_at,
				},
			});
		} else if (folder.sync_status === "modified") {
			if (!folder.server_id) {
				console.warn(`SYNC_SERVICE: Folder ${folder.folder_id} 'modified' but no server_id. Skipping.`);
				continue;
			}
			changesToPush.push({
				table: "folders",
				action: "update",
				data: {
					folder_id: folder.folder_id,
					server_id: folder.server_id,
					user_id: folder.user_id,
					folder_name: folder.folder_name,
					folder_emoji: folder.folder_emoji,
					updated_at: folder.updated_at,
				},
			});
		} else if (folder.sync_status === "deleted_local") {
			if (folder.server_id) {
				changesToPush.push({
					table: "folders",
					action: "delete",
					data: {
						// Only essential data for delete
						folder_id: folder.folder_id, // Client ref
						server_id: folder.server_id, // Server ref
						user_id: folder.user_id, // Validation
					},
				});
			} else {
				await db.folders.delete(folder.folder_id);
			}
		}
	}

	// 2. Gather Bookmarks
	const dirtyBookmarks = await db.bookmarks.filter((b) => b.sync_status !== "synced").toArray();

	for (const bookmark of dirtyBookmarks) {
		changesAttemptedCount++;
		if (bookmark.sync_status === "new") {
			changesToPush.push({
				table: "bookmarks",
				action: "create",
				data: {
					bookmark_id: bookmark.bookmark_id,
					user_id: bookmark.user_id,
					folder_id: bookmark.folder_id,
					url: bookmark.url,
					title: bookmark.title,
					created_at: bookmark.created_at,
					updated_at: bookmark.updated_at,
				},
			});
		} else if (bookmark.sync_status === "modified") {
			changesToPush.push({
				table: "bookmarks",
				action: "update",
				data: {
					bookmark_id: bookmark.bookmark_id,
					user_id: bookmark.user_id,
					folder_id: bookmark.folder_id,
					url: bookmark.url,
					title: bookmark.title,
					updated_at: bookmark.updated_at,
				} as ApiChangeItemDataBookmark, // Assert type
			});
		} else if (bookmark.sync_status === "deleted_local") {
			changesToPush.push({
				table: "bookmarks",
				action: "delete",
				data: {
					// Only essential data for delete
					bookmark_id: bookmark.bookmark_id,
					user_id: bookmark.user_id,
				},
			});
		}
	}

	if (changesToPush.length === 0) {
		console.log("SYNC_SERVICE: No local changes to push (changesToPush array is empty).");
		return;
	}
	console.log("SYNC_SERVICE: Pushing changes to server:", JSON.stringify(changesToPush, null, 2));

	// 3. Send to server API
	try {
		const response = await fetch(`${API_BASE_URL}/push`, {
			method: "POST", // Ensure method is POST
			headers: {
				"Content-Type": "application/json",
				// Authorization: `Bearer ${clerkToken}` // If needed
			},
			body: JSON.stringify({ changes: changesToPush }), // Ensure body is correctly stringified
		});
		if (!response.ok) {
			const errorData = await response.json().catch(() => ({ message: response.statusText, results: [] }));
			console.error(`SYNC_SERVICE: Push API request failed: ${response.status}`, errorData);

			// Mark all attempted items as 'error'
			await db.transaction("rw", db.folders, db.bookmarks, async () => {
				for (const change of changesToPush) {
					// Iterate over the ones we *tried* to send
					if (change.table === "folders") {
						// Here, change.data is ApiChangeItemDataFolder | ApiChangeItemDataBookmark
						// We need to cast or check 'table' again to access folder_id safely
						const folderPayload = change.data as ApiChangeItemDataFolder;
						if (folderPayload.folder_id) {
							// folder_id is optional in the union for delete
							await db.folders.where("folder_id").equals(folderPayload.folder_id).modify({ sync_status: "error" });
						} else if (folderPayload.server_id) {
							// Fallback for deletes that only have server_id
							await db.folders.where("server_id").equals(folderPayload.server_id).modify({ sync_status: "error" });
						}
					} else if (change.table === "bookmarks") {
						const bookmarkPayload = change.data as ApiChangeItemDataBookmark;
						await db.bookmarks
							.where("bookmark_id")
							.equals(bookmarkPayload.bookmark_id)
							.modify({ sync_status: "error" });
					}
				}
			});
			throw new Error(`Push API request failed: ${response.status} ${errorData.message || ""}`);
		}

		const { results } = await response.json(); // results is any[] from server
		console.log("SYNC_SERVICE: Push API results from server:", results);

		// 4. Process server results
		await db.transaction("rw", db.folders, db.bookmarks, async () => {
			for (const result of results) {
				// `result` here is an object from the server's `results` array
				// The server result should ideally include a 'table' field or enough info to deduce it.
				// For now, we rely on client_id structure.
				// A more robust server response would be: { client_id: "...", table: "folders", status: "...", ... }
				let tableType: "folders" | "bookmarks" | undefined;
				let originalClientData: ApiChangeItemDataFolder | ApiChangeItemDataBookmark | undefined;

				// Try to find the original change item to determine the table and full client data
				const originalChange = changesToPush.find(
					(c) =>
						(c.table === "folders" && (c.data as ApiChangeItemDataFolder).folder_id === result.client_id) ||
						(c.table === "bookmarks" && (c.data as ApiChangeItemDataBookmark).bookmark_id === result.client_id)
				);

				if (originalChange) {
					tableType = originalChange.table;
					if (tableType === "folders") {
						originalClientData = originalChange.data as ApiChangeItemDataFolder;
					} else if (tableType === "bookmarks") {
						originalClientData = originalChange.data as ApiChangeItemDataBookmark;
					}
				} else {
					// Fallback if server result doesn't perfectly map back or if client_id isn't unique across types
					// This part is tricky without more info in server response.
					// Assuming folder client_ids and bookmark client_ids are distinct enough or server helps.
					// For simplicity, we'll assume client_id on result is sufficient for now.
					console.warn(
						"SYNC_SERVICE: Could not find original change for result, inferring table based on result structure.",
						result
					);
					if (result.server_id !== undefined && typeof result.server_id === "number") {
						// Folders have numeric server_id
						tableType = "folders";
					} else if (result.client_id && typeof result.client_id === "string" && !result.server_id) {
						// Bookmarks use string client_id as PK
						tableType = "bookmarks";
					}
				}

				if (result.status === "error") {
					console.error(
						`SYNC_SERVICE: Server reported error for item (client_id: ${result.client_id}, server_id: ${result.server_id}): ${result.message}`
					);
					if (result.client_id) {
						if (tableType === "folders") {
							await db.folders.where("folder_id").equals(result.client_id).modify({ sync_status: "error" });
						} else if (tableType === "bookmarks") {
							await db.bookmarks.where("bookmark_id").equals(result.client_id).modify({ sync_status: "error" });
						}
					}
					continue;
				}

				changesSuccessfullyProcessedCount++;

				if (tableType === "folders") {
					if (result.status === "created") {
						await db.folders.where("folder_id").equals(result.client_id).modify({
							server_id: result.server_id,
							updated_at: result.updated_at,
							sync_status: "synced",
						});
					} else if (result.status === "updated") {
						// For folders, server result provides server_id. We find by that to update.
						if (result.server_id != null) {
							// Ensure server_id is present
							const localFolder = await db.folders.get({ server_id: result.server_id } as any); // Query by index
							if (localFolder) {
								await db.folders.update(localFolder.folder_id, {
									// Update by Dexie PK
									updated_at: result.updated_at,
									sync_status: "synced",
								});
							} else {
								console.warn(`SYNC_SERVICE: Local folder with server_id ${result.server_id} not found for update.`);
							}
						} else {
							console.warn(
								`SYNC_SERVICE: Server result for folder update missing server_id. Client ID: ${result.client_id}`
							);
						}
					} else if (result.status === "deleted") {
						await db.folders.delete(result.client_id); // Delete by client_id/folder_id
						await db.bookmarks.where("folder_id").equals(result.client_id).delete();
					}
				} else if (tableType === "bookmarks") {
					if (result.status === "created" || result.status === "updated") {
						await db.bookmarks.where("bookmark_id").equals(result.client_id).modify({
							updated_at: result.updated_at,
							sync_status: "synced",
						});
					} else if (result.status === "deleted") {
						await db.bookmarks.delete(result.client_id);
					}
				}
			}
		});
		console.log(
			`SYNC_SERVICE: Successfully pushed and processed ${changesSuccessfullyProcessedCount} of ${changesAttemptedCount} items.`
		);
	} catch (error) {
		/* ... general error handling ... */
	}
}

// --- Pull Server Changes to Client ---
async function pullChanges() {
	console.log("SYNC_SERVICE: Starting pullChanges...");
	let itemsPulled = 0;

	const foldersLastSync = await getLastSyncTimestamp(LAST_SYNC_FOLDERS_KEY);
	const bookmarksLastSync = await getLastSyncTimestamp(LAST_SYNC_BOOKMARKS_KEY);

	console.log(`SYNC_SERVICE: Pulling changes since folders: ${foldersLastSync}, bookmarks: ${bookmarksLastSync}`);

	try {
		const response = await fetch(
			`${API_BASE_URL}/pull?folders_last_sync=${foldersLastSync}&bookmarks_last_sync=${bookmarksLastSync}`,
			{
				headers: {
					/* ... */
				},
			}
		);

		if (!response.ok) {
			/* ... error handling ... */
		}

		const data = await response.json();
		console.log("SYNC_SERVICE: Pull API response data:", data);

		await db.transaction("rw", db.folders, db.bookmarks, async () => {
			// Process active folders
			if (data.folders && data.folders.length > 0) {
				// The API response 'data.folders' items are already shaped like ClientFolder
				// We just need to ensure all required fields for Dexie are present and types are correct.
				const clientFoldersToPut = data.folders.map(
					(folderFromServer: any): Folder => ({
						folder_id: folderFromServer.folder_id, // THIS IS THE DEXIE PRIMARY KEY
						server_id: folderFromServer.server_id != null ? Number(folderFromServer.server_id) : undefined,
						user_id: folderFromServer.user_id,
						folder_name: folderFromServer.folder_name,
						folder_emoji: folderFromServer.folder_emoji,
						created_at: Number(folderFromServer.created_at),
						updated_at: Number(folderFromServer.updated_at),
						sync_status: "synced", // All data from server is considered 'synced'
						is_deleted: folderFromServer.is_deleted || false, // Ensure boolean
					})
				);

				// Validate that folder_id is present for all items before bulkPut
				const invalidFolder = clientFoldersToPut.find(
					(f: { folder_id: null | undefined }) => f.folder_id === undefined || f.folder_id === null
				);
				if (invalidFolder) {
					console.error(
						"SYNC_SERVICE: Invalid folder data from server, missing folder_id:",
						invalidFolder,
						"Original data:",
						data.folders
					);
					throw new Error("Invalid folder data from server: missing folder_id for Dexie primary key.");
				}

				await db.folders.bulkPut(clientFoldersToPut);
				itemsPulled += clientFoldersToPut.length;
			}

			// Process active bookmarks (assuming similar structure from API)
			if (data.bookmarks && data.bookmarks.length > 0) {
				const clientBookmarksToPut = data.bookmarks.map(
					(bookmarkFromServer: any): Bookmark => ({
						bookmark_id: bookmarkFromServer.bookmark_id, // DEXIE PRIMARY KEY
						user_id: bookmarkFromServer.user_id,
						folder_id: bookmarkFromServer.folder_id,
						url: bookmarkFromServer.url,
						title: bookmarkFromServer.title,
						created_at: Number(bookmarkFromServer.created_at),
						updated_at: Number(bookmarkFromServer.updated_at),
						sync_status: "synced",
						is_deleted: bookmarkFromServer.is_deleted || false,
					})
				);

				const invalidBookmark = clientBookmarksToPut.find(
					(b: { bookmark_id: null | undefined }) => b.bookmark_id === undefined || b.bookmark_id === null
				);
				if (invalidBookmark) {
					console.error(
						"SYNC_SERVICE: Invalid bookmark data from server, missing bookmark_id:",
						invalidBookmark,
						"Original data:",
						data.bookmarks
					);
					throw new Error("Invalid bookmark data from server: missing bookmark_id for Dexie primary key.");
				}

				await db.bookmarks.bulkPut(clientBookmarksToPut);
				itemsPulled += clientBookmarksToPut.length;
			}

			// Process deleted folder IDs
			if (data.deleted_folders_ids && data.deleted_folders_ids.length > 0) {
				const serverIdsToDelete: number[] = data.deleted_folders_ids;
				for (const serverId of serverIdsToDelete) {
					const foldersMatchingServerId = await db.folders.where("server_id").equals(serverId).toArray();
					if (foldersMatchingServerId.length > 0) {
						const clientFolderIdsToDelete = foldersMatchingServerId.map((f) => f.folder_id);
						await db.folders.bulkDelete(clientFolderIdsToDelete);
						await db.bookmarks.where("folder_id").anyOf(clientFolderIdsToDelete).delete(); // Cascade delete bookmarks
						itemsPulled += clientFolderIdsToDelete.length;
					}
				}
			}

			// Process deleted bookmark IDs
			if (data.deleted_bookmarks_ids && data.deleted_bookmarks_ids.length > 0) {
				const bookmarkIdsToDelete: string[] = data.deleted_bookmarks_ids;
				await db.bookmarks.bulkDelete(bookmarkIdsToDelete);
				itemsPulled += bookmarkIdsToDelete.length;
			}
		});

		await setLastSyncTimestamp(LAST_SYNC_FOLDERS_KEY, data.server_current_timestamp);
		await setLastSyncTimestamp(LAST_SYNC_BOOKMARKS_KEY, data.server_current_timestamp);

		console.log(`SYNC_SERVICE: Successfully processed ${itemsPulled} pulled items.`);
	} catch (error) {
		console.error("SYNC_SERVICE: Error during pullChanges:", error);
		throw error;
	}
}

// --- Main Synchronization Orchestrator ---
let isSyncing = false; // Simple lock to prevent concurrent syncs

export async function synchronize() {
	if (isSyncing) {
		console.log("SYNC_SERVICE: Sync already in progress. Skipping.");
		return;
	}
	if (!navigator.onLine) {
		console.log("SYNC_SERVICE: Offline. Skipping sync.");
		return;
	}

	isSyncing = true;
	console.log("SYNC_SERVICE: Starting synchronization...");

	try {
		await pushChanges();
		await pullChanges();
		console.log("SYNC_SERVICE: Synchronization finished successfully.");
		window.dispatchEvent(new CustomEvent("datasync-complete", { detail: { success: true } }));
	} catch (error) {
		console.error("SYNC_SERVICE: Synchronization failed:", error);
		window.dispatchEvent(new CustomEvent("datasync-complete", { detail: { success: false, error } }));
	} finally {
		isSyncing = false;
	}
}
