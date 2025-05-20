import { db, type Folder } from "./dexie";
import { synchronize } from "./syncService";

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
		created_at: Date.now(),
		updated_at: Date.now(),
		sync_status: "new",
		is_deleted: false,
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
	//if (!folderId) throw new Error("El ID de la carpeta es obligatorio para actualizar.");

	const existingFolder = await db.folders.get(folderId);
	if (!existingFolder) {
		console.error(`FolderService: Folder with id ${folderId} not found for update.`);
		throw new Error("Folder not found");
	}

	const now = Date.now();
	let newSyncStatus: Folder["sync_status"] = "modified";

	// If the folder was 'new' and hasn't been synced yet, it should remain 'new'.
	// If it was 'error', an update should probably try to re-sync it as 'modified'.
	if (existingFolder.sync_status === "new") {
		newSyncStatus = "new";
	} else if (existingFolder.sync_status === "deleted_local") {
		// This case should ideally not happen if UI prevents editing deleted items.
		// If it does, it's a conflict or an un-delete operation.
		console.warn(`FolderService: Updating a folder ${folderId} marked as 'deleted_local'. Setting to 'modified'.`);
		newSyncStatus = "modified"; // Or handle as an "undelete" if you have that logic
	}

	const updatesWithSyncInfo: Partial<Folder> = {
		...updates, // The actual field changes (folder_name, folder_emoji)
		updated_at: now,
		sync_status: newSyncStatus,
		is_deleted: false, // Ensure it's not marked as deleted if being updated
	};

	await db.folders.update(folderId, updatesWithSyncInfo);
	console.log(`FolderService: Folder ${folderId} updated locally. New sync_status: ${newSyncStatus}`);
	// scheduleSync(); // Optional: trigger a debounced sync

	try {
		const numUpdated = await db.folders.update(folderId, updates);
		if (numUpdated === 0) {
			throw new Error(`Folder with ID ${folderId} not found or no changes applied.`);
		}
		const updatedFolder = await db.folders.get(folderId);
		if (!updatedFolder) {
			throw new Error(`Folder with ID ${folderId} not found after update attempt.`);
		}

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
	const existingFolder = await db.folders.get(folderId);

	if (!existingFolder) {
		console.warn(`FolderService: Folder ${folderId} not found for deletion.`);
		return;
	}

	console.log(
		`FolderService: Marking folder ${folderId} as deleted. Current status: ${existingFolder.sync_status}, server_id: ${existingFolder.server_id}`
	);

	if (existingFolder.sync_status === "new" && !existingFolder.server_id) {
		// If it was 'new' and definitely never made it to the server (no server_id),
		// we can just delete it locally. It won't be in any pushChanges batch.
		console.log(`FolderService: Folder ${folderId} was 'new' and unsynced. Hard deleting locally.`);
		await db.folders.delete(folderId);
		// Also delete its associated bookmarks if they were also 'new'
		await db.bookmarks.where({ folder_id: folderId, sync_status: "new" }).delete();
	} else {
		// If it was 'synced', 'modified', 'error', or even 'deleted_local' again (idempotency),
		// or 'new' but somehow got a server_id (shouldn't happen with correct logic but safe to handle),
		// mark it for server deletion.
		console.log(`FolderService: Folder ${folderId} will be marked 'deleted_local' for server sync.`);
		await db.folders.update(folderId, {
			is_deleted: true, // For UI filtering
			sync_status: "deleted_local",
			updated_at: Date.now(),
		});

		await synchronize();
	}
}

/**
 * Fetches all folders for a given user, sorted by creation date.
 * @param userId - The ID of the user.
 * @returns A promise that resolves to an array of Folder objects.
 */
export async function getFoldersForUser(userId: string): Promise<Folder[]> {
	if (!userId) return []; // Or throw error
	return db.folders.where("user_id").equals(userId).sortBy("created_at");
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
