import { db, type Folder } from "./dexie";

export interface NewFolderDetails {
	folder_name: string;
	folder_emoji: string;
}

/**
 * Agrega una nueva carpeta a la base de datos Dexie
 * @param details - El nombre y el emoji de la carpeta
 * @param userId - El ID del usuario (de Clerk) que crea la carpeta
 * @returns The newly created Folder object.
 * @throws Error if the database operation fails.
 */
export async function addNewFolder(details: NewFolderDetails, userId: string): Promise<Folder> {
	const nowHolder = Date.now();
	const now = new Date(nowHolder).toISOString();

	if (!userId) {
		throw new Error("El ID del usuario (de Clerk) es obligatorio para crear una carpeta.");
	}
	if (!details.folder_name.trim()) {
		throw new Error("La carpeta debe tener un nombre.");
	}

	const newFolder: Folder = {
		folder_id: crypto.randomUUID(),
		folder_name: details.folder_name.trim(),
		folder_emoji: details.folder_emoji || "📂", // Default emoji if none provided
		user_id: userId, // Store the Clerk user ID
		created_at: now,
		updated_at: now,
		sync_status: "pending",
	};

	try {
		await db.folders.add(newFolder);
		console.log("Carpeta añadida a Dexie:", newFolder);
		return newFolder;
	} catch (error) {
		console.error("No se pudo añadir la carpeta a Dexie:", error);

		throw new Error(`Error al crear la carpeta: ${error instanceof Error ? error.message : String(error)}`);
	}
}

/**
 * Actualiza una carpeta en la base de datos Dexie
 * @param folderId - El ID de la carpeta a actualizar
 * @param updates - Un objeto con los campos a actualizar
 * @returns El objeto de la carpeta actualizada
 * @throws Error si la operación de la base de datos falla
 */
export async function updateFolder(
	folderId: string,
	updates: Partial<Pick<Folder, "folder_name" | "folder_emoji" | "updated_at">>
): Promise<Folder> {
	if (!folderId) throw new Error("El ID de la carpeta es obligatorio para actualizar.");

	try {
		const numUpdated = await db.folders.update(folderId, updates);
		if (numUpdated === 0) {
			throw new Error(`Folder with ID ${folderId} not found or no changes applied.`);
		}
		const updatedFolder = await db.folders.get(folderId);
		if (!updatedFolder) {
			throw new Error(`Folder with ID ${folderId} not found after update attempt.`);
		}
		console.log("Folder updated successfully in Dexie:", updatedFolder);
		return updatedFolder;
	} catch (error) {
		console.error("Failed to update folder in Dexie:", error);
		throw new Error(`Failed to update folder: ${error instanceof Error ? error.message : String(error)}`);
	}
}

/**
 * Elimina una carpeta de la base de datos Dexie
 * @param folderId - El ID de la carpeta a eliminar
 * @throws Error si la operación de la base de datos falla
 */
export async function deleteFolder(folderId: string): Promise<void> {
	if (!folderId) throw new Error("El ID de la carpeta es obligatorio para eliminar.");
	try {
		await db.folders.delete(folderId);
		console.log("Carpeta eliminada de Dexie:", folderId);
	} catch (error) {
		console.error("No se pudo eliminar la carpeta de Dexie:", error);
		throw new Error(`Failed to delete folder: ${error instanceof Error ? error.message : String(error)}`);
	}
}

// You can also add functions here to fetch folders, etc.
/**
 * Fetches all folders for a given user, sorted by creation date.
 * @param userId - The ID of the user.
 * @returns A promise that resolves to an array of Folder objects.
 */
export async function getFoldersForUser(userId: string): Promise<Folder[]> {
	if (!userId) return []; // Or throw error
	return db.folders.where("folder_user_id").equals(userId).sortBy("created_at");
}

/**
 * Fetches a single folder by its ID.
 * @param folderId - The ID of the folder.
 * @returns A promise that resolves to the Folder object or undefined if not found.
 */
export async function getFolderById(folderId: string): Promise<Folder | undefined> {
	if (!folderId) return undefined;
	return db.folders.get(folderId); // Assumes folder_id is the primary key
}

export type { Folder };
