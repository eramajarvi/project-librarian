import "../styles/index.css";
import "../styles/folderList.css";
import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react"; // For getting the current user
import { getFoldersForUser, type Folder } from "../lib/folderService"; // Your service function and type

interface FolderListProps {
	onFolderSelect: (folderId: string) => void; // Callback to inform parent of selection
	initiallySelectedFolderId?: string | null; // Optional: To set an initial selection
}

const FolderList: React.FC<FolderListProps> = ({ onFolderSelect, initiallySelectedFolderId }) => {
	const { user, isLoaded: clerkIsLoaded } = useUser();
	const [folders, setFolders] = useState<Folder[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedFolderId, setSelectedFolderId] = useState<string | null>(initiallySelectedFolderId || null);

	useEffect(() => {
		// Set initial selection if provided and different from current
		if (initiallySelectedFolderId && initiallySelectedFolderId !== selectedFolderId) {
			setSelectedFolderId(initiallySelectedFolderId);
		}
	}, [initiallySelectedFolderId, selectedFolderId]);

	useEffect(() => {
		const fetchFolders = async () => {
			if (!clerkIsLoaded) return; // Wait for Clerk to load

			if (user && user.id) {
				setIsLoading(true);
				setError(null);
				try {
					const userFolders = await getFoldersForUser(user.id);
					setFolders(userFolders);

					if (!selectedFolderId && userFolders.length > 0) {
						// Check if initiallySelectedFolderId is valid among fetched folders
						const initialIsValid =
							initiallySelectedFolderId && userFolders.some((f) => f.folder_id === initiallySelectedFolderId);
						const firstFolderId = userFolders[0].folder_id;

						if (initialIsValid && initiallySelectedFolderId) {
							// setSelectedFolderId(initiallySelectedFolderId); // Already handled by above useEffect
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
						// If current selection is invalid (e.g. folder deleted), select first
						const firstFolderId = userFolders[0].folder_id;
						setSelectedFolderId(firstFolderId);
						onFolderSelect(firstFolderId);
					} else if (userFolders.length === 0) {
						setSelectedFolderId(null); // No folders, no selection
					}
				} catch (err) {
					console.error("Failed to fetch folders:", err);
					setError(err instanceof Error ? err.message : "An unknown error occurred");
					setFolders([]);
				} finally {
					setIsLoading(false);
				}
			} else if (clerkIsLoaded && !user) {
				// User is not signed in
				setFolders([]);
				setIsLoading(false);
				setSelectedFolderId(null);
			}
		};

		fetchFolders();
	}, [user, clerkIsLoaded, onFolderSelect, initiallySelectedFolderId]); // Removed selectedFolderId from deps to avoid loop with onFolderSelect

	const handleFolderClick = (folderId: string) => {
		setSelectedFolderId(folderId);
		onFolderSelect(folderId); // Notify parent component
	};

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
		<ul className="folder-list">
			{folders.map((folder) => (
				<li
					key={folder.folder_id}
					className={`folder-list-item ${folder.folder_id === selectedFolderId ? "selected" : ""}`}
					onClick={() => handleFolderClick(folder.folder_id)}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") handleFolderClick(folder.folder_id);
					}}
					tabIndex={0} // Make it focusable
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

export default FolderList;
