import "../styles/index.css";
import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
// Removed: import { db } from "../lib/dexie"; // Use service instead

import EmptyBookmarkPlaceholder from "./EmptyBookmarkPlaceholder";
import LoadingBookmarkPlaceholder from "./LoadingBookmarkPlaceholder"; // Assuming you have this
// import BookmarkPlaceholder from "./BookmarkPlaceholder"; // Not used in current logic
import SingleScreenshot from "./SingleScreenshot";
import AddBookmark, { type NewBookmarkData } from "./AddBookmark"; // Import the modal

interface CurveProps {
	selectedFolderId: string | null;
}

import {
	addBookmarkToFolder as serviceAddBookmarkToFolder,
	getBookmarksForFolder as serviceGetBookmarksForFolder,
	type Bookmark,
} from "../lib/bookmarkService";

function Curve({ selectedFolderId }: CurveProps) {
	const { isSignedIn, user, isLoaded: clerkIsLoaded } = useUser();

	const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const [isAddBookmarkOpen, setIsAddBookmarkOpen] = useState(false);

	const isOwner = isSignedIn && user;

	// --- Añadir Marcador Handlers ---
	const handleOpenAddBookmarkModal = () => {
		if (selectedFolderId && isOwner) {
			// Revisar si la carpeta seleccionada existe y si el usuario es propietario
			setIsAddBookmarkOpen(true);
		} else if (!selectedFolderId) {
			console.warn("No se puede añadir el marcador: Carpeta no seleccionada.");
		} else if (!isOwner) {
			console.warn("No se puede añadir el marcador: Usuario no es propietario.");
		}
	};
	const handleCloseAddBookmarkModal = () => setIsAddBookmarkOpen(false);

	const handleAcceptAddBookmark = async (newBookmarkDetails: NewBookmarkData, folderId: string) => {
		if (!user || !user.id || !folderId) {
			console.error("El usuario no está autenticado o la carpeta no es válida");
			handleCloseAddBookmarkModal();
			return;
		}

		try {
			const addedBookmark = await serviceAddBookmarkToFolder(newBookmarkDetails, folderId, user.id);

			setBookmarks((prevBookmarks) =>
				[...prevBookmarks, addedBookmark].sort(
					(a, b) => (new Date(a.created_at).getTime() || 0) - (new Date(b.created_at).getTime() || 0)
				)
			);
			console.log("Marcador añadido y estado local actualizado:", addedBookmark);
		} catch (err) {
			console.error("Error al añadir el marcador:", err);
			setError(err instanceof Error ? err : new Error("Error al añadir el marcador"));
		}
		handleCloseAddBookmarkModal();
	};

	useEffect(() => {
		async function fetchBookmarksForFolder() {
			if (!selectedFolderId || !user || !user.id || !clerkIsLoaded) {
				setBookmarks([]);
				setLoading(false); // Stop loading if no folder or user
				if (clerkIsLoaded && selectedFolderId && !user) {
					console.log("Curve: El usuario no está autenticado.");
				}
				return;
			}

			setLoading(true);
			setError(null);
			try {
				console.log("Curve: Cargando marcadores para la carpeta:", selectedFolderId, "ID del usuario:", user.id);

				const folderBookmarks = await serviceGetBookmarksForFolder(selectedFolderId, user.id);
				setBookmarks(
					folderBookmarks.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
				);
				console.log("Curve: Marcadores encontrados:", folderBookmarks.length);
			} catch (err) {
				console.error("Error al cargar marcadores para la carpeta:", selectedFolderId, err);
				setError(err instanceof Error ? err : new Error("Error desconocido al cargar marcadores"));
				setBookmarks([]);
			} finally {
				setLoading(false);
			}
		}

		if (clerkIsLoaded) {
			fetchBookmarksForFolder();
		}
	}, [selectedFolderId, user, clerkIsLoaded]);

	const numberOfPlaceholders = 12;
	const divPlaceholders = Array.from({ length: numberOfPlaceholders });

	if (!clerkIsLoaded) {
		return (
			<div className="curve-container">
				<div className="carousel-bottom basegrid">
					{divPlaceholders.map((_, index) => (
						<div key={`loading-div-${index + 1}`} className={`div${index + 1}`}>
							<LoadingBookmarkPlaceholder />
						</div>
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="curve-container">
				<div className="carousel-bottom basegrid">
					<div style={{ gridColumn: "span 12", textAlign: "center", padding: "20px" }}>
						Error al cargar marcadores: {error.message}
					</div>
				</div>
			</div>
		);
	}

	if (!selectedFolderId) {
		return (
			<div className="curve-container">
				<div className="carousel-bottom basegrid">
					{divPlaceholders.map((_, index) => (
						<div key={`empty-folder-div-${index + 1}`} className={`div${index + 1}`}>
							<LoadingBookmarkPlaceholder />
						</div>
					))}
				</div>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="curve-container">
				<div className="carousel-bottom basegrid">
					{divPlaceholders.map((_, index) => (
						<div key={`loading-sel-div-${index + 1}`} className={`div${index + 1}`}>
							<LoadingBookmarkPlaceholder />
						</div>
					))}
				</div>
			</div>
		);
	}

	if (bookmarks.length === 0) {
		return (
			<div className="curve-container">
				<div className="carousel-bottom basegrid">
					{divPlaceholders.map((_, index) => (
						<div key={`empty-bm-div-${index + 1}`} className={`div${index + 1}`}>
							<EmptyBookmarkPlaceholder onAddBookmarkClick={handleOpenAddBookmarkModal} />
						</div>
					))}
				</div>

				{isAddBookmarkOpen && selectedFolderId && isOwner && (
					<AddBookmark
						isOpen={isAddBookmarkOpen}
						folderId={selectedFolderId}
						onAccept={handleAcceptAddBookmark}
						onCancel={handleCloseAddBookmarkModal}
						title={`Añadir Marcador a Carpeta`}
					/>
				)}
			</div>
		);
	}

	return (
		<div className="curve-container">
			<div className="carousel-bottom basegrid">
				{divPlaceholders.map((_, index) => {
					const bookmark = bookmarks[index];

					return (
						<div key={`bm-div-${index + 1}`} className={`div${index + 1}`}>
							{bookmark ? (
								<a
									style={{ textDecoration: "none" }}
									href={bookmark.url}
									target="_blank"
									rel="noopener noreferrer"
									title={bookmark.title}>
									<SingleScreenshot bookmarkURL={bookmark.url} bookmarkTitle={bookmark.title} />
								</a>
							) : (
								isOwner && <EmptyBookmarkPlaceholder onAddBookmarkClick={handleOpenAddBookmarkModal} />
							)}
						</div>
					);
				})}
			</div>

			{isAddBookmarkOpen && selectedFolderId && isOwner && (
				<AddBookmark
					isOpen={isAddBookmarkOpen}
					folderId={selectedFolderId}
					onAccept={handleAcceptAddBookmark}
					onCancel={handleCloseAddBookmarkModal}
					title={`Añadir marcador`}
				/>
			)}
		</div>
	);
}

export default Curve;
