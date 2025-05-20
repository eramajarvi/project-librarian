import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { getBookmarksForFolder, type Bookmark } from "../lib/bookmarkService";

interface RightPaneBottomProps {
	selectedFolderId: string | null;
	onAddBookmarkClick: () => void;
	onEditBookmarkClick: (bookmark: Bookmark) => void;
	onDeleteBookmarkClick: (bookmark_id: string, bookmarkName: string) => void;
	refreshKey?: number;
}

const RightPaneBottom: React.FC<RightPaneBottomProps> = ({
	selectedFolderId,
	onAddBookmarkClick,
	onEditBookmarkClick,
	onDeleteBookmarkClick,
	refreshKey,
}) => {
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
	}, [selectedFolderId, user, clerkIsLoaded, refreshKey]);

	const handleEditBookmark = (bookmark: Bookmark) => {
		console.log("EditBookmark clicked:", bookmark);
		onEditBookmarkClick(bookmark);
	};

	const handleDeleteBookmark = (bookmark_id: string, bookmarkName: string) => {
		// if (window.confirm(`¿Tienes la seguridad de que deseas eliminar el marcador "${bookmarkName}"?`)) {
		// 	onDeleteBookmarkClick(bookmark_id, bookmarkName);
		// }

		onDeleteBookmarkClick(bookmark_id, bookmarkName);
	};

	const renderContent = () => {
		if (!selectedFolderId && !isLoading) {
			return (
				<div className="bookmarks-container placeholder-message">
					<p>Selecciona una colección para ver sus marcadores.</p>
				</div>
			);
		}

		if (isLoading) {
			return (
				<table className="bookmark-table is-loading">
					<thead>...</thead>
					<tbody>
						{Array.from({ length: 3 }).map((_, i) => (
							<tr key={i}>
								<td colSpan={4}>
									<div className="shimmer-row"></div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			);
		}

		if (error) {
			return (
				<div className="bookmarks-container error-message">
					<p>Error al cargar marcadores: {error}</p>
				</div>
			);
		}

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
					{bookmarks.length === 0 && selectedFolderId && !isLoading && !error
						? Array.from({ length: 6 }).map((_, index) => (
								<tr key={`empty-row-${index}`} className="bookmark-table-row empty-placeholder-row">
									<td className="td-favicon">
										<span className="favicon-placeholder"> </span>
									</td>
									<td className="td-name">
										<span className="text-placeholder"> </span>
									</td>
									<td className="td-url">
										<span className="text-placeholder"> </span>
									</td>
									<td className="td-actions">
										<span className="action-placeholder"> </span>
									</td>
								</tr>
						  ))
						: bookmarks.map((bookmark) => (
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
										<button
											className="action-button edit-button"
											title="Editar marcador"
											onClick={() => handleEditBookmark(bookmark)}>
											EDITAR
										</button>
										<button
											className="action-button delete-button"
											title="Eliminar marcador"
											onClick={() => handleDeleteBookmark(bookmark.bookmark_id, bookmark.title)}>
											ELIMINAR
										</button>
									</td>
								</tr>
						  ))}
				</tbody>
			</table>
		);
	};

	return (
		<div className="right-pane-bottom-container">
			<div className="bookmarks-content-area">
				{renderContent()}

				{clerkIsLoaded && user && selectedFolderId && (
					<div className="bookmarks-footer folder-list-footer">
						<button className="add-bookmark-button add-folder-button edit-button" onClick={onAddBookmarkClick}>
							+
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default RightPaneBottom;
