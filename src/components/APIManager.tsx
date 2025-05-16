import { use, useEffect, useState } from "react";

function APIManager() {
	const [bookmarks, setBookmarks] = useState([]);

	const [folders, setFolders] = useState([]);

	useEffect(() => {
		fetch("/api/bookmarks")
			.then((res) => res.json())
			.then(setBookmarks);
	}, []);

	useEffect(() => {
		fetch("/api/folders")
			.then((res) => res.json())
			.then(setFolders);
	}, []);

	return (
		<div>
			<h1>Bookmarks</h1>
			<ul>
				{bookmarks.map((b: { id: number; url: string }) => (
					<li key={b.id}>{b.url}</li>
				))}
			</ul>

			<h1>Folders</h1>
			{folders.map((f: { id: number; name: string; emoji: string }) => (
				<li key={f.id}>
					{f.emoji}
					{f.name}
				</li>
			))}
		</div>
	);
}

export default APIManager;
