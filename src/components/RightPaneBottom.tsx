import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { getBookmarksForFolder, type Bookmark } from "../lib/bookmarkService";

interface RightPaneBottomContentProps {
	selectedFolderId: string | null;
	onAddBookmarkClick: () => void;
}

const RightPaneBottomContent: React.FC<RightPaneBottomContentProps> = ({ selectedFolderId, onAddBookmarkClick }) => {
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
				setBookmarks([]);
				setIsLoading(false);
				setError(null);
			}
		};

		fetchBookmarks();
	}, [selectedFolderId, user, clerkIsLoaded]);

	const renderContent = () => {
		if (!selectedFolderId && !isLoading) {
			return (
				<div className="bookmarks-container placeholder-message">
					<p>Selecciona una colección para ver sus marcadores.</p>
				</div>
			);
		}

		if (isLoading) {
			return <div className="bookmarks-container loading-message"></div>;
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
				</div>
			);
		}

		if (bookmarks.length > 0) {
			return (
				<table className="bookmark-table">
					<thead>
						<tr>
							<th className="th-favicon"></th>
							<th className="th-name">Marcador</th>
							<th className="th-url">URL</th>
							<th className="th-actions">​</th>
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
										EDITAR
									</button>
									<button className="action-button delete-button" title="Eliminar marcador">
										ELIMINAR
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			);
		}

		return null;
	};

	return (
		<div className="right-pane-bottom-container">
			<div className="bookmarks-content-area">{renderContent()}</div>

			{clerkIsLoaded && user && selectedFolderId && (
				<div className="bookmarks-footer">
					<button className="add-bookmark-button base-button" onClick={onAddBookmarkClick}>
						<span role="img" aria-label="add bookmark icon" style={{ marginRight: "8px" }}>
							➕
						</span>
						Añadir Marcador
					</button>
				</div>
			)}
		</div>
	);
};

export default RightPaneBottomContent;
