import "../styles/index.css";
import React, { useState, useEffect } from "react";
import { db, type Bookmark } from "../lib/dexie";

import EmptyBookmarkPlaceholder from "./EmptyBookmarkPlaceholder";

interface CurveProps {
	selectedFolderId: string | null;
}

function Curve({ selectedFolderId }: CurveProps) {
	const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		async function fetchBookmarksForFolder() {
			if (!selectedFolderId) {
				setBookmarks([]);
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				console.log("Curve: Fetching bookmarks for folder ID:", selectedFolderId);

				const folderBookmarks = await db.bookmarks.where("folder_id").equals(selectedFolderId).toArray();
				setBookmarks(folderBookmarks);
				setError(null);
				console.log("Curve: Found bookmarks:", folderBookmarks.length);
			} catch (err) {
				console.error("Error fetching bookmarks for folder:", selectedFolderId, err);
				setError(err instanceof Error ? err : new Error("Unknown error fetching bookmarks"));
				setBookmarks([]);
			} finally {
				setLoading(false);
			}
		}

		fetchBookmarksForFolder();
	}, [selectedFolderId]);

	if (error) {
		return (
			<div className="curve-container">
				<div className="carousel-bottom basegrid">
					<div>Error al cargar marcadores: {error.message}</div>
				</div>
			</div>
		);
	}

	if (!selectedFolderId) {
		return (
			<div className="curve-container">
				<div className="carousel-bottom basegrid">
					<div>Por favor, selecciona una carpeta para ver los marcadores.</div>
				</div>
			</div>
		);
	}

	if (bookmarks.length === 0) {
		return (
			<div className="curve-container">
				<div className="carousel-bottom basegrid">
					<div>No hay marcadores en esta carpeta.</div>
				</div>
			</div>
		);
	}

	const divPlaceholders = Array.from({ length: 12 });

	return (
		<div className="curve-container">
			<div className="carousel-bottom basegrid">
				{divPlaceholders.map((_, index) => {
					const bookmark = bookmarks[index];

					return (
						<div key={`div-${index + 1}`} className={`div${index + 1}`}>
							{bookmark ? (
								<a href={bookmark.url} target="_blank" rel="noopener noreferrer" title={bookmark.title}>
									{/* Display favicon or initial, or just title */}
									{bookmark.title.length > 15 ? `${bookmark.title.substring(0, 15)}...` : bookmark.title}
								</a>
							) : (
								<EmptyBookmarkPlaceholder />
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default Curve;
