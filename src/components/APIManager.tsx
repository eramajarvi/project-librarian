import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { createPlaceholderDataDexie } from "@/lib/createPlaceholderDataDexie";

import { db, type Bookmark, type Folder } from "../lib/dexie";

import { synchronize } from "@/lib/syncService";

function APIManager() {
	const { isSignedIn, user, isLoaded } = useUser();

	const [hasRun, setHasRun] = useState(false);

	// Si el usuario es nuevo, le añadimos algunos datos de ejemplo :)
	const createdAt = user?.createdAt;

	const hasRunRef = useRef(false);

	useEffect(() => {
		if (!isLoaded || !user || !createdAt || hasRunRef.current) return;

		const now = new Date();
		const diferenciaEnSegundos = Math.abs(now.getTime() - createdAt.getTime()) / 1000;

		if (diferenciaEnSegundos < 10) {
			console.log("API Manager: han pasado: ", { diferenciaEnSegundos }, "y hasRunRef is: ", hasRunRef.current);
			createPlaceholderDataDexie(user);
			hasRunRef.current = true; // persists during the session
		}
	}, [isLoaded, user, createdAt]);

	useEffect(() => {
		if (!isLoaded) return;

		if (user) {
			console.log("APIManager: User is authenticated. Triggering synchronization.");
			synchronize()
				.then(() => {
					console.log("APIManager: Synchronization attempt completed.");
				})
				.catch((err) => {
					console.error("APIManager: Synchronization attempt failed:", err);
				});
		} else {
			console.log("APIManager: User is not signed in. Skipping synchronization.");
		}
	}, [isLoaded, user]);

	return <div></div>;
}

export default APIManager;
