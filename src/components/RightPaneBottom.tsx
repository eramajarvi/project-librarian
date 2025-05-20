// src/components/RightPaneBottomContent.tsx
import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { getBookmarksForFolder, type Bookmark } from "../lib/bookmarkService"; // Assuming bookmarkService.ts exists
// import "../styles/RightPaneBottomContent.css";

interface RightPaneBottomContentProps {
	selectedFolderId: string | null;
}

const RightPaneBottomContent: React.FC<RightPaneBottomContentProps> = ({ selectedFolderId }) => {
	const { user, isLoaded: clerkIsLoaded } = useUser();
	const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchBookmarks = async () => {
			if (!clerkIsLoaded) return; // Wait for Clerk

			if (selectedFolderId && user && user.id) {
				setIsLoading(true);
				setError(null);
				try {
					const folderBookmarks = await getBookmarksForFolder(selectedFolderId, user.id);
					setBookmarks(folderBookmarks);
				} catch (err) {
					console.error("Failed to fetch bookmarks:", err);
					setError(err instanceof Error ? err.message : "An unknown error occurred while fetching bookmarks.");
					setBookmarks([]);
				} finally {
					setIsLoading(false);
				}
			} else {
				// No folder selected or user not available
				setBookmarks([]);
				setIsLoading(false); // Ensure loading is false if no fetch occurs
				setError(null);
			}
		};

		fetchBookmarks();
	}, [selectedFolderId, user, clerkIsLoaded]);

	if (!selectedFolderId) {
		return (
			<div className="bookmarks-container placeholder-message">
				<p>Selecciona una colección para ver sus marcadores.</p>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="bookmarks-container loading-message">
				<p>Cargando marcadores...</p>
				{/* You can add a spinner component here */}
			</div>
		);
	}

	if (error) {
		return (
			<div className="bookmarks-container error-message">
				<p>Error al cargar marcadores: {error}</p>
			</div>
		);
	}

	if (bookmarks.length === 0) {
		return (
			<div className="bookmarks-container empty-message">
				<p>Esta colección no tiene marcadores todavía.</p>
				{/* You might add an "Add Bookmark" button here later,
                    which would likely call a function passed down from BookmarksView
                    to open an AddBookmark modal.
                */}
			</div>
		);
	}

	return (
		<div className="bookmarks-container">
			<table className="bookmark-table">
				<thead>
					<tr>
						<th className="th-favicon"></th>
						<th className="th-name">Marcador</th>
						<th className="th-url">URL</th>
						<th className="th-actions">Acciones</th>
					</tr>
				</thead>
				<tbody>
					{bookmarks.map((bookmark) => (
						<tr key={bookmark.bookmark_id} className="bookmark-table-row">
							<td className="td-favicon">
								<span className="favicon-placeholder">
									<img src="/assets/SiteIcon.png" alt="Favicon" className="favicon-img" />
								</span>
							</td>
							<td className="td-name">
								<a href={bookmark.url} target="_blank" rel="noopener noreferrer" title={bookmark.title}>
									{bookmark.title.length > 30 ? `${bookmark.title.substring(0, 27)}...` : bookmark.title}
								</a>
							</td>
							<td className="td-url">
								<a href={bookmark.url} target="_blank" rel="noopener noreferrer" title={bookmark.url}>
									{bookmark.url.length > 60 ? `${bookmark.url.substring(0, 57)}...` : bookmark.url}
								</a>
							</td>
							<td className="td-actions">
								<button className="action-button edit-button" title="Editar marcador">
									✏️
								</button>
								<button className="action-button delete-button" title="Eliminar marcador">
									🗑️
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default RightPaneBottomContent;
