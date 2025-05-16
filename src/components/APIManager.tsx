import { useEffect, useState } from "react";
import { db, type Bookmark } from "../lib/dexie";

function APIManager() {
	const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

	const [folders, setFolders] = useState([]);

	// Load from local DB
	useEffect(() => {
		db.bookmarks.toArray().then(setBookmarks);
	}, []);

	// Add bookmark locally
	const addBookmark = async () => {
		const newBookmark: Bookmark = {
			id: crypto.randomUUID(),
			folder_id: 1,
			url: "https://example.com",
			title: "Example",
			created_at: Date.now(),
			sync_status: "pending",
		};
		await db.bookmarks.add(newBookmark);
		setBookmarks(await db.bookmarks.toArray());
	};

	useEffect(() => {
		const interval = setInterval(async () => {
			const unsynced = await db.bookmarks.where("syncStatus").equals("pending").toArray();

			for (const bookmark of unsynced) {
				try {
					const res = await fetch("/api/bookmarks", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(bookmark),
					});

					if (res.ok) {
						await db.bookmarks.update(bookmark.id, { sync_status: "synced" });
						setBookmarks(await db.bookmarks.toArray());
					}
				} catch (err) {
					console.error("Sync failed", err);
				}
			}
		}, 5000);

		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		fetch("/api/folders")
			.then((res) => res.json())
			.then(setFolders);
	}, []);

	return (
		<div>
			<h1>Bookmarks</h1>
			{/* <ul>
				{bookmarks.map((b: { id: number; url: string }) => (
					<li key={b.id}>{b.url}</li>
				))}
			</ul> */}
			<div>
				<button onClick={addBookmark}>Add Bookmark</button>
				<ul>
					{bookmarks.map((b) => (
						<li key={b.id}>
							{b.title} - {b.url} ({b.sync_status})
						</li>
					))}
				</ul>
			</div>

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
