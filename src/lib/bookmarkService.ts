import { db, type Bookmark } from "./dexie";

export interface NewBookmarkDetails {
	url: string;
	name: string;
}

/**
 * Agrega un nuevo marcador a una carpeta específicada
 * @param details - La URL y el nombre del marcador
 * @param folderId - El ID de la carpeta a la que se añadirá el marcador
 * @param userId - El ID del usuario (de Clerk) que crea el marcador
 * @returns The newly created Bookmark object.
 * @throws Error if the database operation fails.
 */
export async function addBookmarkToFolder(
	details: NewBookmarkDetails,
	folderId: string,
	userId: string
): Promise<Bookmark> {
	const nowHolder = Date.now();
	const now = new Date(nowHolder).toISOString();

	if (!folderId) {
		throw new Error("El folderId es obligatorio para añadir un marcador");
	}
	if (!userId) {
		throw new Error("El ID del usuario (de Clerk) es obligatorio para crear un marcador");
	}
	if (!details.url.trim() || !details.name.trim()) {
		throw new Error("La URL y el nombre del marcador son obligatorios para crear un marcador");
	}

	const newBookmark: Bookmark = {
		bookmark_id: crypto.randomUUID(),
		url: details.url.trim(),
		title: details.name.trim(),
		folder_id: folderId,
		user_id: userId,
		created_at: now,
		updated_at: now,
		sync_status: "pending",
	};

	try {
		await db.bookmarks.add(newBookmark);
		console.log("Marcador añadido a Dexie:", newBookmark);

		// await db.folders.update(folderId, {
		//   bookmark_ids: Dexie.〟(arr => [...(arr || []), newBookmark.id])
		// });

		return newBookmark;
	} catch (error) {
		console.error("Ocurrió un error al añadir el marcador:", error);
		throw new Error(`Failed to create bookmark: ${error instanceof Error ? error.message : String(error)}`);
	}
}

/**
 * Obtiene todos los marcadores de una carpeta específica
 * @param folderId El ID de la carpeta de la que se quieren obtener los marcadores.
 * @param userId El ID del usuario (de Clerk) que posee la carpeta.
 * @returns A promise that resolves to an array of Bookmark objects.
 */
export async function getBookmarksForFolder(folderId: string, userId: string): Promise<Bookmark[]> {
	if (!folderId || !userId) return [];
	return db.bookmarks.where({ folder_id: folderId, user_id: userId }).sortBy("created_at");
}
export type { Bookmark };
