// src/components/RightPaneTopContent.tsx
import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { getBookmarksForFolder, type Bookmark } from "../lib/bookmarkService";
import SingleScreenshot from "./SingleScreenshot";
import "../styles/rightPaneTop.css"; // Styles will be updated for carousel

interface RightPaneTopContentProps {
	selectedFolderId: string | null;
}

const RightPaneTopContent: React.FC<RightPaneTopContentProps> = ({ selectedFolderId }) => {
	const { user, isLoaded: clerkIsLoaded } = useUser();
	const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [activeIndex, setActiveIndex] = useState(0);

	const carouselTrackRef = useRef<HTMLDivElement>(null);
	// Store refs to each carousel item to observe them
	const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

	const MAX_CAROUSEL_ITEMS = 25;

	useEffect(() => {
		// Initialize or resize itemRefs array when bookmarks change
		itemRefs.current = itemRefs.current.slice(0, bookmarks.length);
	}, [bookmarks.length]);

	useEffect(() => {
		const fetchBookmarks = async () => {
			if (!clerkIsLoaded) return;

			if (selectedFolderId && user && user.id) {
				setIsLoading(true);
				setError(null);
				try {
					const folderBookmarks = await getBookmarksForFolder(selectedFolderId, user.id);

					const sortedBookmarks = folderBookmarks.sort((a, b) => {
						const aCreatedAt = typeof a.created_at === "number" ? a.created_at : 0;
						const bCreatedAt = typeof b.created_at === "number" ? b.created_at : 0;
						return bCreatedAt - aCreatedAt;
					});

					setBookmarks(sortedBookmarks.slice(0, MAX_CAROUSEL_ITEMS));
					setActiveIndex(0);
				} catch (err) {
					console.error("Ocurrio", err);
					setError(err instanceof Error ? err.message : "An unknown error occurred.");
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

	if (!selectedFolderId) {
		return (
			<div className="top-pane-carousel-container placeholder-message">
				<p>Selecciona una colección.</p>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="top-pane-carousel-container loading-carousel">
				{/* Simple loading text, or you can create skeleton loaders for carousel items */}
				<p>Cargando vistas previas...</p>
				{/* Example of a few shimmer items for loading state */}
				{/* <div className="carousel-track">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={`loading-${index}`} className="carousel-item loading-shimmer-item"></div>
                    ))}
                </div> */}
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
				<p>No hay marcadores en esta colección para mostrar en la vista previa.</p>
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
