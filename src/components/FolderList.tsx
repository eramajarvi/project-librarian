import "../styles/index.css";
import "../styles/folderList.css";
import "../styles/buttons.css";
import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react"; // For getting the current user
import { getFoldersForUser, type Folder } from "../lib/folderService"; // Your service function and type

interface FolderListProps {
	onFolderSelect: (folderId: string) => void;
	initiallySelectedFolderId?: string | null;
	onAddFolderClick: () => void;
}

const FolderList: React.FC<FolderListProps> = ({ onFolderSelect, initiallySelectedFolderId, onAddFolderClick }) => {
	const { user, isLoaded: clerkIsLoaded } = useUser();
	const [folders, setFolders] = useState<Folder[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedFolderId, setSelectedFolderId] = useState<string | null>(initiallySelectedFolderId || null);

	useEffect(() => {
		if (initiallySelectedFolderId && initiallySelectedFolderId !== selectedFolderId) {
			setSelectedFolderId(initiallySelectedFolderId);
		}
	}, [initiallySelectedFolderId, selectedFolderId]);

	useEffect(() => {
		const fetchFolders = async () => {
			if (!clerkIsLoaded) return;

			if (user && user.id) {
				setIsLoading(true);
				setError(null);
				try {
					const userFolders = await getFoldersForUser(user.id);
					setFolders(userFolders);

					if (!selectedFolderId && userFolders.length > 0) {
						const initialIsValid =
							initiallySelectedFolderId && userFolders.some((f) => f.folder_id === initiallySelectedFolderId);
						const firstFolderId = userFolders[0].folder_id;

						if (initialIsValid && initiallySelectedFolderId) {
							// setSelectedFolderId(initiallySelectedFolderId);
							onFolderSelect(initiallySelectedFolderId);
						} else {
							setSelectedFolderId(firstFolderId);
							onFolderSelect(firstFolderId);
						}
					} else if (
						selectedFolderId &&
						userFolders.length > 0 &&
						!userFolders.some((f) => f.folder_id === selectedFolderId)
					) {
						const firstFolderId = userFolders[0].folder_id;
						setSelectedFolderId(firstFolderId);
						onFolderSelect(firstFolderId);
					} else if (userFolders.length === 0) {
						setSelectedFolderId(null);
					}
				} catch (err) {
					console.error("Error al obtener las carpetas:", err);
					setError(err instanceof Error ? err.message : "Un error desconocido ocurrió.");
					setFolders([]);
				} finally {
					setIsLoading(false);
				}
			} else if (clerkIsLoaded && !user) {
				setFolders([]);
				setIsLoading(false);
				setSelectedFolderId(null);
			}
		};

		fetchFolders();
	}, [user, clerkIsLoaded, onFolderSelect, initiallySelectedFolderId]);

	const handleFolderClick = (folderId: string) => {
		setSelectedFolderId(folderId);
		onFolderSelect(folderId);
	};

	const renderContent = () => {
		if (!clerkIsLoaded || isLoading) {
			return <div className="folder-list-loading">Cargando colecciones...</div>;
		}

		if (error) {
			return <div className="folder-list-error">Error: {error}</div>;
		}

		if (folders.length === 0) {
			return <div className="folder-list-empty">No hay colecciones.</div>;
			// You might want an "Add Folder" button here later
		}

		return (
			<ul className="folder-list-scrollable-area">
				{folders.map((folder) => (
					<li
						key={folder.folder_id}
						className={`folder-list-item ${folder.folder_id === selectedFolderId ? "selected" : ""}`}
						onClick={() => handleFolderClick(folder.folder_id)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") handleFolderClick(folder.folder_id);
						}}
						tabIndex={0}
						role="button"
						aria-pressed={folder.folder_id === selectedFolderId}
						aria-label={folder.folder_name}>
						<span className="folder-emoji">{folder.folder_emoji || "📂"}</span>
						<span className="folder-name">{folder.folder_name}</span>
					</li>
				))}
			</ul>
		);
	};

	return (
		<div className="folder-list-container">
			<div className="folder-list-content">
				{renderContent()}
				{clerkIsLoaded && user && (
					<div className="folder-list-footer">
						<button className="add-folder-button edit-button" onClick={onAddFolderClick}>
							+
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default FolderList;
