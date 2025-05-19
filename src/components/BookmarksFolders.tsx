import "../styles/index.css";
import React, { useState, useEffect } from "react";
import { db, type Folder } from "../lib/dexie";

function BookmarksFolders() {
	const [folders, setFolders] = useState<Folder[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [selectedFolder, setSelectedFolder] = useState("");

	useEffect(() => {
		async function fetchFolders() {
			try {
				setLoading(true);
				const allFolders = await db.folders.toArray();
				setFolders(allFolders);
				setError(null);
			} catch (err) {
				console.error("Hubo un error al cargar las carpetas:", err);
				setError(err instanceof Error ? err : new Error("Unknown error"));
				setFolders([]);
			} finally {
				setLoading(false);
			}
		}

		fetchFolders();
	}, []);

	const handleFolderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const selectedValue = event.target.value;
		setSelectedFolder(selectedValue);
		console.log("Selected folder:", selectedValue);
	};

	if (loading) {
		return (
			<div className="bookmarks-dropdown-wrapper">
				<select id="bookmarksFolders" name="bookmarksFoldersSelector" className="bookmarks-dropdown">
					<option value="" disabled>
						Cargando...
					</option>
				</select>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bookmarks-dropdown-wrapper">
				<select id="bookmarksFolders" name="bookmarksFoldersSelector" className="bookmarks-dropdown">
					<option value="" disabled>
						Error al cargar las carpetas
					</option>
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
				value={selectedFolder}
				onChange={handleFolderChange}>
				{/*  */}

				<option value="" disabled={folders.length > 0}>
					{folders.length > 0 ? "Select a folder..." : "No folders available"}
				</option>

				{folders.map((folder) => (
					<option key={folder.folder_id} value={folder.folder_id}>
						{folder.folder_emoji} {folder.folder_name}
					</option>
				))}

				{/* <option value="one">
					<p>🦁</p>
					<div>editar</div>
				</option>

				<option value="four">
					<p>🚨</p>
					<div>eliminar</div>
				</option> */}
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
