import type { APIRoute, APIContext } from "astro";
import { createClient, type InValue, type Client as TursoClient } from "@libsql/client";

import type { Folder as ClientFolder, Bookmark as ClientBookmark } from "../../../lib/dexie";

// --- Inicializacion del cliente de Turso ---
const tursoDBUrl = import.meta.env.TURSO_DATABASE_URL;
const tursoAuthToken = import.meta.env.TURSO_AUTH_TOKEN;

if (!tursoDBUrl) {
	console.error("Error: No existe la variable de entorno TURSO_DATABASE_URL!");
}
if (!tursoAuthToken && !tursoDBUrl?.startsWith("file:")) {
	console.error("Error: No existe la variable de entorno TURSO_AUTH_TOKEN!");
}

let turso: TursoClient;
try {
	turso = createClient({
		url: tursoDBUrl!,
		authToken: tursoAuthToken,
	});
	console.log("Cliente de Turso inicializado para la API de /push.");
} catch (e) {
	console.error("Error al inicializar el cliente de Turso:", e);
}

interface ChangeItem {
	table: "folders" | "bookmarks";
	action: "create" | "update" | "delete";
	data: Partial<ClientFolder & ClientBookmark & { server_id_folder_for_delete?: number }>;
}

// --- Handler principal de la ruta de API ---
export const POST: APIRoute = async (context: APIContext) => {
	if (!turso) {
		console.error("Push API: Cliente de Turso no inicializado.");
		return new Response(JSON.stringify({ error: "Servicio de la base de datos no disponible." }), { status: 503 });
	}

	// --- Autenticación con Clerk ---
	const { userId, redirectToSignIn } = context.locals.auth();

	if (!userId) {
		console.log("Push API: No autorizado. El usuario no ha iniciado sesión.");
		return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
	}
	// --- Fin Autenticación con Clerk ---

	const requestTimestamp = Date.now();

	try {
		const payload = await context.request.json();
		const changes: ChangeItem[] = payload.changes;

		if (!changes || !Array.isArray(changes)) {
			return new Response(JSON.stringify({ error: 'Payload inválido: "changes" debe ser un array.' }), {
				status: 400,
			});
		}

		// console.log(`Push API: User ${userId} submitting ${changes.length} changes.`);
		const results = [];

		for (const change of changes) {
			// --- FOLDERS ---
			if (change.table === "folders") {
				const folderData = change.data as Partial<ClientFolder>;

				if (folderData.user_id !== userId) {
					console.warn(
						`Push API: Folder user_id mismatch for client_folder_id ${folderData.folder_id}. Expected ${userId}, got ${folderData.user_id}`
					);
					results.push({
						client_id: folderData.folder_id,
						status: "error",
						message: "User ID mismatch",
						table: "folders",
					});
					continue;
				}

				if (change.action === "create") {
					if (
						!folderData.folder_id ||
						!folderData.folder_name ||
						folderData.created_at == null ||
						folderData.updated_at == null
					) {
						results.push({
							client_id: folderData.folder_id,
							status: "error",
							message: "Missing required fields for folder create",
							table: "folders",
						});
						continue;
					}
					try {
						const stmt =
							"INSERT INTO folders (client_folder_id, user_id, name, emoji, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)";
						const args = [
							folderData.folder_id,
							userId,
							folderData.folder_name,
							folderData.folder_emoji || "📂",
							folderData.created_at,
							requestTimestamp,
						];
						const rs = await turso.execute({ sql: stmt, args });
						results.push({
							client_id: folderData.folder_id,
							server_id: rs.lastInsertRowid ? Number(rs.lastInsertRowid) : null,
							updated_at: requestTimestamp,
							status: "created",
							table: "folders",
						});
					} catch (e: any) {
						console.error(`Push API: Error creating folder ${folderData.folder_id} for user ${userId}:`, e.message);
						results.push({
							client_id: folderData.folder_id,
							status: "error",
							message: e.message.includes("UNIQUE constraint failed")
								? "Conflict: Item may already exist"
								: "DB error on create",
							table: "folders",
						});
					}
				} else if (change.action === "update") {
					if (!folderData.server_id || !folderData.folder_name) {
						results.push({
							client_id: folderData.folder_id,
							server_id: folderData.server_id,
							status: "error",
							message: "Missing server_id or name for folder update",
							table: "folders",
						});
						continue;
					}
					try {
						const stmt = "UPDATE folders SET name = ?, emoji = ?, updated_at = ? WHERE id = ? AND user_id = ?";
						const args = [
							folderData.folder_name,
							folderData.folder_emoji || "📂",
							requestTimestamp,
							folderData.server_id,
							userId,
						];
						const rs = await turso.execute({ sql: stmt, args });
						if (rs.rowsAffected > 0) {
							results.push({
								server_id: folderData.server_id,
								client_id: folderData.folder_id,
								updated_at: requestTimestamp,
								status: "updated",
								table: "folders",
							});
						} else {
							results.push({
								server_id: folderData.server_id,
								client_id: folderData.folder_id,
								status: "error",
								message: "Folder not found or not owner for update",
								table: "folders",
							});
						}
					} catch (e: any) {
						console.error(`Push API: Error updating folder ${folderData.server_id} for user ${userId}:`, e.message);
						results.push({
							server_id: folderData.server_id,
							client_id: folderData.folder_id,
							status: "error",
							message: "DB error on update",
							table: "folders",
						});
					}
				} else if (change.action === "delete") {
					const serverIdToDelete = folderData.server_id;
					if (!serverIdToDelete) {
						results.push({
							client_id: folderData.folder_id,
							status: "error",
							message: "Missing server_id for folder delete",
							table: "folders",
						});
						continue;
					}
					try {
						const stmt = "DELETE FROM folders WHERE id = ? AND user_id = ?";
						const rs = await turso.execute({ sql: stmt, args: [serverIdToDelete, userId] });
						if (rs.rowsAffected > 0) {
							results.push({
								server_id: serverIdToDelete,
								client_id: folderData.folder_id,
								status: "deleted",
								table: "folders",
							});
						} else {
							results.push({
								server_id: serverIdToDelete,
								client_id: folderData.folder_id,
								status: "error",
								message: "Folder not found or not owner for delete",
								table: "folders",
							});
						}
					} catch (e: any) {
						console.error(`Push API: Error deleting folder ${serverIdToDelete} for user ${userId}:`, e.message);
						results.push({
							server_id: serverIdToDelete,
							client_id: folderData.folder_id,
							status: "error",
							message: "DB error on delete",
							table: "folders",
						});
					}
				}
			}
			// --- BOOKMARKS ---
			else if (change.table === "bookmarks") {
				const bookmarkData = change.data as Partial<ClientBookmark>;

				if (bookmarkData.user_id !== userId) {
					console.warn(
						`Push API: Bookmark user_id mismatch for bookmark_id ${bookmarkData.bookmark_id}. Expected ${userId}, got ${bookmarkData.user_id}`
					);
					results.push({
						client_id: bookmarkData.bookmark_id,
						status: "error",
						message: "User ID mismatch for bookmark",
						table: "bookmarks",
					});
					continue;
				}

				if (change.action === "create") {
					// Assumes Turso schema: __new_bookmarks (bookmark_id, user_id, folder_id, url, title, created_at, updated_at)
					// folder_id is the client_folder_id (UUID)
					if (
						!bookmarkData.bookmark_id ||
						!bookmarkData.url ||
						!bookmarkData.title ||
						!bookmarkData.folder_id ||
						bookmarkData.created_at == null ||
						bookmarkData.updated_at == null
					) {
						results.push({
							client_id: bookmarkData.bookmark_id,
							status: "error",
							message: "Missing required fields for bookmark create",
							table: "bookmarks",
						});
						continue;
					}
					try {
						const stmt =
							"INSERT INTO bookmarks (bookmark_id, user_id, folder_id, url, title, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)";
						const args: InValue[] = [
							bookmarkData.bookmark_id,
							userId,
							bookmarkData.folder_id,
							bookmarkData.url,
							bookmarkData.title,
							bookmarkData.created_at,
							requestTimestamp,
						];
						await turso.execute({ sql: stmt, args });
						results.push({
							client_id: bookmarkData.bookmark_id,
							updated_at: requestTimestamp,
							status: "created",
							table: "bookmarks",
						});
					} catch (e: any) {
						console.error(
							`Push API: Error creating bookmark ${bookmarkData.bookmark_id} for user ${userId}:`,
							e.message
						);
						results.push({
							client_id: bookmarkData.bookmark_id,
							status: "error",
							message: e.message.includes("UNIQUE constraint failed")
								? "Conflict: Item may already exist"
								: "DB error on create",
							table: "bookmarks",
						});
					}
				} else if (change.action === "update") {
					if (!bookmarkData.bookmark_id || !bookmarkData.url || !bookmarkData.title) {
						results.push({
							client_id: bookmarkData.bookmark_id,
							status: "error",
							message: "Missing bookmark_id, url, or title for update",
							table: "bookmarks",
						});
						continue;
					}
					try {
						const stmt =
							"UPDATE bookmarks SET url = ?, title = ?, folder_id = ?, updated_at = ? WHERE bookmark_id = ? AND user_id = ?";
						const args: InValue[] = [
							bookmarkData.url,
							bookmarkData.title,
							bookmarkData.folder_id ?? null,
							requestTimestamp,
							bookmarkData.bookmark_id,
							userId,
						];
						const rs = await turso.execute({ sql: stmt, args });
						if (rs.rowsAffected > 0) {
							results.push({
								client_id: bookmarkData.bookmark_id,
								updated_at: requestTimestamp,
								status: "updated",
								table: "bookmarks",
							});
						} else {
							results.push({
								client_id: bookmarkData.bookmark_id,
								status: "error",
								message: "Bookmark not found or not owner for update",
								table: "bookmarks",
							});
						}
					} catch (e: any) {
						console.error(
							`Push API: Error updating bookmark ${bookmarkData.bookmark_id} for user ${userId}:`,
							e.message
						);
						results.push({
							client_id: bookmarkData.bookmark_id,
							status: "error",
							message: "DB error on update",
							table: "bookmarks",
						});
					}
				} else if (change.action === "delete") {
					if (!bookmarkData.bookmark_id) {
						results.push({
							client_id: bookmarkData.bookmark_id,
							status: "error",
							message: "Missing bookmark_id for delete",
							table: "bookmarks",
						});
						continue;
					}
					try {
						const stmt = "DELETE FROM bookmarks WHERE bookmark_id = ? AND user_id = ?";
						const rs = await turso.execute({ sql: stmt, args: [bookmarkData.bookmark_id, userId] });
						if (rs.rowsAffected > 0) {
							results.push({ client_id: bookmarkData.bookmark_id, status: "deleted", table: "bookmarks" });
						} else {
							results.push({
								client_id: bookmarkData.bookmark_id,
								status: "error",
								message: "Bookmark not found or not owner for delete",
								table: "bookmarks",
							});
						}
					} catch (e: any) {
						console.error(
							`Push API: Error deleting bookmark ${bookmarkData.bookmark_id} for user ${userId}:`,
							e.message
						);
						results.push({
							client_id: bookmarkData.bookmark_id,
							status: "error",
							message: "DB error on delete",
							table: "bookmarks",
						});
					}
				}
			}
		}

		console.log(`Push API: Processed ${changes.length} changes for user ${userId}. Results:`, results.length);
		return new Response(JSON.stringify({ success: true, results }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error: any) {
		console.error("Push API - General Error during processing for user", userId, ":", error);
		return new Response(JSON.stringify({ error: `Sync push failed: ${error.message || "Unknown server error"}` }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};
