import React, { useState } from "react";
import "../styles/index.css";

import FolderList from "./FolderList";

interface BookmarksViewProps {
	username: string;
	isOwner: boolean;
}

export default function BookmarksView({ username, isOwner }: BookmarksViewProps) {
	const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

	const handleFolderSelection = (folderId: string) => {
		console.log("Folder selected in BookmarksView:", folderId);
		setSelectedFolderId(folderId);
		// To do: Fetch and display bookmarks for the selected folder
	};

	return (
		<div className="page-layout-base">
			<div className="two-pane-layout">
				<aside className="left-pane">
					<div className="left-pane-header">
						<p>COLECCIONES</p>
					</div>

					<FolderList
						onFolderSelect={handleFolderSelection}
						initiallySelectedFolderId={selectedFolderId} // Pass current selection down
						// You can also set a default initiallySelectedFolderId here if you want
						// e.g., from localStorage or a hardcoded value on first load
					/>
				</aside>
				<main className="right-pane">
					{" "}
					{/* Changed div to main for semantics */}
					<h2>Detalles del Marcador</h2> {/* Added h2 for clarity */}
					{selectedFolderId ? (
						<p>Marcadores para la carpeta: {selectedFolderId}</p>
					) : (
						<p>Por favor, selecciona una colección de la izquierda.</p>
					)}
					{/* Bookmark details for the selectedFolderId will go here */}
				</main>
			</div>
		</div>
	);
}
