import "../styles/index.css";
import React, { useState, useEffect } from "react";
import { db, type Folder } from "../lib/dexie";

import BookmarksFolders from "./BookmarksFolders";
import Curve from "./Curve";
import EditFolder from "./EditFolder";

interface ViewManagerProps {
	username: string;
	isOwner: boolean;
}

function TopSitesView({ username, isOwner }: ViewManagerProps) {
	const [currentFolderId, setCurrentFolderId] = useState<string | null>("");
	const [initialFolderLoaded, setInitialFolderLoaded] = useState(false);
	const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);

	const [isEditFolderOpen, setIsEditFolderOpen] = useState(false);

	const handleOpenEditFolder = () => {
		if (selectedFolder) {
			setIsEditFolderOpen(true);
		} else {
			console.warn("Ninguna carpeta seleccionada para editar.");
		}
	};
	const handleCloseEditFolder = () => setIsEditFolderOpen(false);

	const handleAcceptEditFolder = async (updatedFolderData: Folder) => {
		console.log("Accepted edit for folder:", updatedFolderData);
		if (!updatedFolderData || !updatedFolderData.folder_id) {
			console.error("Cannot update folder: folder data or ID is missing.", updatedFolderData);
			handleCloseEditFolder();
			return;
		}

		console.log("Attempting to update folder in Dexie:", updatedFolderData);

		try {
			const numUpdated = await db.folders.update(updatedFolderData.folder_id, {
				folder_name: updatedFolderData.folder_name,
				folder_emoji: updatedFolderData.folder_emoji,
			});

			if (numUpdated > 0) {
				console.log("Folder updated successfully in Dexie:", updatedFolderData);

				setSelectedFolder(updatedFolderData);
			} else {
				console.warn("Folder not found or no changes made for ID:", updatedFolderData.folder_id);
			}
		} catch (error) {
			console.error("Failed to update folder in Dexie:", error);
		}

		handleCloseEditFolder();
	};

	useEffect(() => {
		async function fetchAndSetInitialFolderId() {
			if (!initialFolderLoaded) {
				const folders = await db.folders.orderBy("created_at").toArray();

				if (folders.length > 0) {
					setCurrentFolderId(folders[0].folder_id);
					console.log("Initial folder ID selected:", folders[0].folder_id);
				} else {
					console.log("No folders found to select initially.");
				}
				setInitialFolderLoaded(true);
			}
		}
		fetchAndSetInitialFolderId();
	}, [initialFolderLoaded]);

	// Effect to fetch the folder object when currentFolderId changes
	useEffect(() => {
		async function fetchSelectedFolderObject() {
			if (currentFolderId) {
				// Assuming 'folder_id' is the primary key or an indexed field for efficient lookup
				const folder = await db.folders.get(currentFolderId);
				if (folder) {
					setSelectedFolder(folder);
					console.log("Selected folder object:", folder);
				} else {
					setSelectedFolder(null); // Folder not found
					console.warn(`Folder with ID ${currentFolderId} not found.`);
				}
			} else {
				setSelectedFolder(null); // No folder ID selected
			}
		}

		// Only try to fetch if an ID is present or initial loading is done
		// to avoid fetching with null ID immediately on mount if initialFolderLoaded logic hasn't run
		if (initialFolderLoaded || currentFolderId) {
			fetchSelectedFolderObject();
		}
	}, [currentFolderId, initialFolderLoaded]); // Re-run if currentFolderId or initialFolderLoaded changes

	const handleFolderSelect = (folderId: string) => {
		console.log("BookmarksManager: Folder selected:", folderId);
		setCurrentFolderId(folderId);
	};

	return (
		<div className="topsites-container">
			<Curve selectedFolderId={currentFolderId} />

			<BookmarksFolders onFolderSelect={handleFolderSelect} initiallySelectedFolderId={currentFolderId || ""} />

			<div className="edit-button-container">
				<button className="base-button edit-button" onClick={handleOpenEditFolder}>
					Editar
				</button>

				{isEditFolderOpen && selectedFolder && (
					<EditFolder
						isOpen={isEditFolderOpen}
						title={`Editar carpeta: ${selectedFolder.folder_name}`}
						folder={selectedFolder}
						onAccept={handleAcceptEditFolder}
						onCancel={handleCloseEditFolder}
						onDeleteFolder={() => console.log("Delete folder:", selectedFolder.folder_id)}>
						<p></p>
					</EditFolder>
				)}
			</div>
		</div>
	);
}

export default TopSitesView;
