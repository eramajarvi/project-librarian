// src/components/RightPaneTopContent.tsx
import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { getBookmarksForFolder, type Bookmark } from "../lib/bookmarkService";
import SingleScreenshot from "./SingleScreenshot";
import "../styles/rightPaneTop.css"; // Styles will be updated for carousel

interface RightPaneTopContentProps {
	selectedFolderId: string | null;
	refreshKey?: number;
}

const RightPaneTopContent: React.FC<RightPaneTopContentProps> = ({ selectedFolderId, refreshKey }) => {
	const { user, isLoaded: clerkIsLoaded } = useUser();
	const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchBookmarks = async () => {
			if (!clerkIsLoaded) return;

			if (selectedFolderId && user && user.id) {
				setIsLoading(true);
				setError(null);
				try {
					console.log(`RightPaneTop: Buscando marcadores para la carpeta ${selectedFolderId}, key: ${refreshKey}`);
					const folderBookmarks = await getBookmarksForFolder(selectedFolderId, user.id);

					const sortedBookmarks = folderBookmarks.sort((a, b) => {
						const aCreatedAt = typeof a.created_at === "number" ? a.created_at : 0;
						const bCreatedAt = typeof b.created_at === "number" ? b.created_at : 0;
						return bCreatedAt - aCreatedAt;
					});

					setBookmarks(sortedBookmarks);
				} catch (err) {
					console.error("Ocurrió un error al obtener los marcadores:", err);
					setError(err instanceof Error ? err.message : "Un error desconocido ocurrió.");
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

	if (!selectedFolderId) {
		return (
			<div className="top-pane-carousel-container placeholder-message">
				<p>Selecciona una colección.</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="top-pane-carousel-container error-message">
				<p>Error al cargar marcadores: {error}</p>
			</div>
		);
	}

	if (bookmarks.length === 0) {
		return (
			<div className="top-pane-carousel-container empty-message">
				<p>
					No hay marcadores en esta colección para mostrar en la vista previa. Añade uno haciendo clic en el botón +
				</p>
			</div>
		);
	}

	return (
		<div className="top-pane-carousel-container">
			<div className="carousel-track">
				{bookmarks.map((bookmark) => (
					<div key={bookmark.bookmark_id} className="carousel-item">
						<a
							style={{ textDecoration: "none" }}
							href={bookmark.url}
							target="_blank"
							rel="noopener noreferrer"
							title={bookmark.title}>
							<SingleScreenshot bookmarkURL={bookmark.url} bookmarkTitle={bookmark.title} />
						</a>
					</div>
				))}
			</div>
		</div>
	);
};

export default RightPaneTopContent;
