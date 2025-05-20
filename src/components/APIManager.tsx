import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { createPlaceholderDataDexie } from "@/lib/createPlaceholderDataDexie";

import { db, type Bookmark, type Folder } from "../lib/dexie";

import { synchronize } from "@/lib/syncService";

function APIManager() {
	const { isSignedIn, user, isLoaded } = useUser();

	const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
	const [folders, setFolders] = useState<Folder[]>([]);

	// Check if the placeholder data has been created
	const [hasRun, setHasRun] = useState(false);

	// Si el usuario es nuevo, le añadimos algunos datos de ejemplo :)
	useEffect(() => {
		if (!isLoaded) return;

		const createdAt = user?.createdAt;
		console.log("User created at:", createdAt);

		if (!createdAt) return;

		const now = new Date();
		const diferenciaEnsegundos = Math.abs(now.getTime() - createdAt.getTime()) / 1000;
		console.log("Diferencia en minutos:", diferenciaEnsegundos);

		if (user && !hasRun && diferenciaEnsegundos < 20) {
			createPlaceholderDataDexie(user);
			setHasRun(true);
		}
	}, [user]);

	// Load from local DB
	// useEffect(() => {
	// 	db.bookmarks.toArray().then(setBookmarks);
	// }, []);
	// This useEffect handles the general synchronization
	useEffect(() => {
		if (isLoaded && user) {
			// Only run if Clerk has loaded and a user is signed in
			console.log("APIManager: User is authenticated. Triggering synchronization.");
			synchronize()
				.then(() => {
					console.log("APIManager: Synchronization attempt completed.");
				})
				.catch((err) => {
					console.error("APIManager: Synchronization attempt failed:", err);
				});
		} else if (isLoaded && !user) {
			console.log("APIManager: User is not signed in. Skipping synchronization.");
			// Optionally, clear local Dexie data if a user logs out,
			// or ensure data is user-specific so it doesn't leak.
		}
	}, [isLoaded, user]); // Dependencies: re-run if Clerk loads or user changes (login/logout)

	useEffect(() => {
		if (isLoaded && user) {
			console.log("App loaded and user authenticated, triggering initial sync.");
			synchronize().catch((err) => console.error("Initial sync failed on app load:", err));
		}
	}, [isLoaded, user]);

	return <div></div>;
}

export default APIManager;
