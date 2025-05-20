import "../styles/index.css";
import React, { useState, useEffect } from "react";
import { db, type Folder } from "../lib/dexie";

interface BookmarksFoldersProps {
	onFolderSelect: (folderId: string) => void;
	initiallySelectedFolderId: string;
}

function BookmarksFolders({ onFolderSelect, initiallySelectedFolderId }: BookmarksFoldersProps) {
	const [folders, setFolders] = useState<Folder[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		async function fetchFolders() {
			try {
				setLoading(true);
				const allFolders = await db.folders.toArray();
				setFolders(allFolders);
				setError(null);

				if (!initiallySelectedFolderId && allFolders.length > 0) {
					onFolderSelect(allFolders[0].folder_id);
					console.log("BookmarksFolders: Carpeta inicial seleccionada y notificado al padre:", allFolders[0].folder_id);
				} else if (
					initiallySelectedFolderId &&
					!allFolders.some((f) => f.folder_id === initiallySelectedFolderId) &&
					allFolders.length > 0
				) {
					onFolderSelect(allFolders[0].folder_id);
				}
			} catch (err) {
				console.error("Hubo un error al cargar las carpetas:", err);
				setError(err instanceof Error ? err : new Error("Unknown error"));
				setFolders([]);
			} finally {
				setLoading(false);
			}
		}

		fetchFolders();
	}, [onFolderSelect]);

	const handleFolderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const selectedValue = event.target.value;
		onFolderSelect(selectedValue);
		console.log("BookmarksFolders: Folder changed to:", selectedValue);
	};

	// if (loading) {
	// 	return (
	// 		<div className="bookmarks-dropdown-wrapper">
	// 			<select className="bookmarks-dropdown" value="" disabled>
	// 				<option value="">Cargando carpetas...</option>
	// 			</select>
	// 		</div>
	// 	);
	// }

	if (error) {
		return (
			<div className="bookmarks-dropdown-wrapper">
				<select className="bookmarks-dropdown" value="" disabled>
					<option value="">Error al cargar carpetas</option>
				</select>
			</div>
		);
	}

	return (
		<div className="bookmarks-dropdown-wrapper">
			<select
				id="bookmarksFolders"
				name="bookmarksFoldersSelector"
				className="bookmarks-dropdown"
				value={initiallySelectedFolderId} // Value is controlled by parent
				onChange={handleFolderChange}>
				{folders.map((folder) => (
					<option key={folder.folder_id} value={folder.folder_id}>
						{folder.folder_emoji} {folder.folder_name}
					</option>
				))}
			</select>

			<label htmlFor="bookmarksFolders" className="arrow-label-wrapper">
				<div className="arrow-container">
					<div className="arrow"></div>
				</div>
			</label>
		</div>
	);
}

export default BookmarksFolders;
