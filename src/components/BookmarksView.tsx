import React, { useState } from "react";
import "../styles/index.css";

import FolderList from "./FolderList";
import RightPaneTop from "./RightPaneTop";
import RightPaneBottom from "./RightPaneBottom";

interface BookmarksViewProps {
	username: string;
	isOwner: boolean;
}

export default function BookmarksView({ username, isOwner }: BookmarksViewProps) {
	const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

	const handleFolderSelection = (folderId: string) => {
		console.log("Folder selected in BookmarksView:", folderId);
		setSelectedFolderId(folderId);
		// To do: Fetch and display bookmarks for the selected folder
	};

	return (
		<div className="page-layout-base">
			<div className="two-pane-layout">
				<aside className="left-pane">
					<div className="left-pane-header">
						<p>COLECCIONES</p>
					</div>

					<FolderList
						onFolderSelect={handleFolderSelection}
						initiallySelectedFolderId={selectedFolderId} // Pass current selection down
						// You can also set a default initiallySelectedFolderId here if you want
						// e.g., from localStorage or a hardcoded value on first load
					/>
				</aside>
				<main className="right-pane">
					<div className="right-pane-top">
						<RightPaneTop selectedFolderId={selectedFolderId} />
					</div>
					<div className="right-pane-bottom">
						<RightPaneBottom selectedFolderId={selectedFolderId} />
					</div>
				</main>
			</div>
		</div>
	);
}
