import "../styles/index.css";
import React, { useState, useEffect } from "react";
import { db, type Folder } from "../lib/dexie";

import BookmarksFolders from "./BookmarksFolders";
import Curve from "./Curve";

function TopSitesView() {
	const [currentFolderId, setCurrentFolderId] = useState<string | null>("");
	const [initialFolderLoaded, setInitialFolderLoaded] = useState(false);

	useEffect(() => {
		async function fetchAndSetInitialFolder() {
			if (!initialFolderLoaded) {
				const folders = await db.folders.toArray();

				if (folders.length > 0) {
					setCurrentFolderId(folders[0].folder_id);
					console.log("Selected folder:", folders[0].folder_id);
				}

				setInitialFolderLoaded(true);
			}
		}
		fetchAndSetInitialFolder();
	}, [initialFolderLoaded]);

	const handleFolderSelect = (folderId: string) => {
		console.log("BookmarksManager: Folder selected:", folderId);
		setCurrentFolderId(folderId);
	};

	return (
		<div className="topsites-container">
			<BookmarksFolders onFolderSelect={handleFolderSelect} initiallySelectedFolderId={currentFolderId || ""} />

			<Curve selectedFolderId={currentFolderId} />
		</div>
	);
}

export default TopSitesView;
