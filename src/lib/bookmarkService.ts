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
		created_at: Date.now(),
		updated_at: Date.now(),
		sync_status: "new",
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

export interface UpdateBookmarkDetails {
	url?: string;
	name?: string;
}

/**
 * Actualiza un marcador existente en la base de datos
 * @param bookmark_id El ID del marcador a actualizar.
 * @param details Un objeto que contiene los nuevos detalles del marcador.
 * @returns Un objeto Bookmark actualizado.
 */
export async function updateBookmark(bookmark_id: string, updates: UpdateBookmarkDetails): Promise<Bookmark> {
	if (!bookmark_id) throw new Error("El ID del marcador es obligatorio para actualizar.");
	if (Object.keys(updates).length === 0) throw new Error("No hay actualizaciones para aplicar al marcador.");

	if (updates.url) {
		try {
			new URL(updates.url);
		} catch (e) {
			throw new Error("URL inválida para actualizar el marcador.");
		}
	}

	try {
		const numUpdated = await db.bookmarks.update(bookmark_id, updates);
		if (numUpdated === 0) {
			throw new Error(`El marcador con ID ${bookmark_id} no se encontró o no se aplicaron cambios.`);
		}
		const updatedBookmark = await db.bookmarks.get(bookmark_id);
		if (!updatedBookmark) {
			throw new Error(`El marcador con ID ${bookmark_id} no se encontró después de la actualización.`);
		}
		console.log("Marcador actualizado correctamente:", updatedBookmark);
		return updatedBookmark;
	} catch (error) {
		console.error("No se pudo actualizar el marcador:", error);
		throw new Error(`No se pudo actualizar el marcador: ${error instanceof Error ? error.message : String(error)}`);
	}
}

/**
 * Elimina un marcador de la base de datos
 * @param bookmark_id El ID del marcador a eliminar.
 */
export async function deleteBookmark(bookmark_id: string): Promise<void> {
	if (!bookmark_id) throw new Error("El ID del marcador es obligatorio para eliminar.");
	try {
		await db.bookmarks.delete(bookmark_id);
		console.log("Marcador eliminado correctamente:", bookmark_id);
	} catch (error) {
		console.error("Failed to delete bookmark:", error);
		throw new Error(`Failed to delete bookmark: ${error instanceof Error ? error.message : String(error)}`);
	}
}
