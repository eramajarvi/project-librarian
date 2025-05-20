import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import "../styles/index.css";

import FolderList from "./FolderList";
import RightPaneTop from "./RightPaneTop";
import RightPaneBottom from "./RightPaneBottom";

import AddFolder, { type NewFolderData } from "./AddFolder";
import { addNewFolder as serviceAddNewFolder, type Folder } from "../lib/folderService";

interface BookmarksViewProps {
	username: string;
	isOwner: boolean;
}

export default function BookmarksView({ username, isOwner }: BookmarksViewProps) {
	const { user, isLoaded: clerkIsLoaded } = useUser();

	const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
	const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
	const [refreshFolderListKey, setRefreshFolderListKey] = useState(0);

	const handleFolderSelection = (folderId: string) => {
		console.log("Folder selected in BookmarksView:", folderId);
		setSelectedFolderId(folderId);
	};

	const handleOpenAddFolderModal = () => {
		if (user) {
			setIsAddFolderModalOpen(true);
		} else {
			console.warn("El usuario no está autenticado. No se puede añadir una carpeta.");
		}
	};

	const handleCloseAddFolderModal = () => setIsAddFolderModalOpen(false);

	const handleAcceptAddFolder = async (newFolderDetails: NewFolderData) => {
		if (!user || !user.id) {
			console.error("El usuario no está autenticado. No se puede añadir una carpeta.");
			handleCloseAddFolderModal();
			return;
		}
		try {
			const newlyAddedFolder = await serviceAddNewFolder(newFolderDetails, user.id);
			console.log("New folder added:", newlyAddedFolder);
			handleCloseAddFolderModal();
			setSelectedFolderId(newlyAddedFolder.folder_id);
			setRefreshFolderListKey((prevKey) => prevKey + 1);
		} catch (error) {
			console.error("Error adding folder from BookmarksView:", error);

			handleCloseAddFolderModal();
		}
	};

	return (
		<div className="page-layout-base">
			<div className="two-pane-layout">
				<aside className="left-pane">
					<div className="left-pane-header">
						<p>COLECCIONES</p>
					</div>

					<FolderList
						key={refreshFolderListKey}
						onFolderSelect={handleFolderSelection}
						initiallySelectedFolderId={selectedFolderId}
						onAddFolderClick={isOwner ? handleOpenAddFolderModal : () => {}}
					/>
				</aside>
				<main className="right-pane">
					<div className="right-pane-top">
						<RightPaneTop selectedFolderId={selectedFolderId} />
					</div>
					<div className="right-pane-bottom">
						<RightPaneBottom selectedFolderId={selectedFolderId} />
					</div>
				</main>

				{isOwner && isAddFolderModalOpen && (
					<AddFolder
						isOpen={isAddFolderModalOpen}
						title="Crear Nueva Colección"
						onAccept={handleAcceptAddFolder}
						onCancel={handleCloseAddFolderModal}
					/>
				)}
			</div>
		</div>
	);
}
