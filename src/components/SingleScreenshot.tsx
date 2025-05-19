import "../styles/index.css";

import { useEffect, useState } from "react";
import { db } from "../lib/dexie";

import LoadingBookmarkPlaceholder from "./LoadingBookmarkPlaceholder";
import BookmarkPlaceholder from "./BookmarkPlaceholder";
import EmptyBookmarkPlaceholder from "./EmptyBookmarkPlaceholder";

interface SingleScreenshotProps {
	bookmarkURL: string;
	bookmarkTitle: string;
}

export default function SingleScreenshot({ bookmarkURL, bookmarkTitle }: SingleScreenshotProps) {
	const [screenshot, setScreenshot] = useState<string | null>(null);
	const [imageSrc, setImageSrc] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const nowHolder = Date.now();
	const now = new Date(nowHolder).toISOString();

	useEffect(() => {
		// If no targetUrl is provided, don't attempt to fetch
		if (!bookmarkURL) {
			setLoading(false);
			setError("No URL provided to screenshot.");
			return;
		}

		const fetchScreenshot = async () => {
			setLoading(true); // Reset loading state for new URL
			setError(null); // Reset error state
			setImageSrc(null); // Reset image source

			try {
				// Primero revisa la base de datos local para ver si ya existe la imagen
				const cachedScreenshot = await db.screenshot_cache.get(bookmarkURL);
				if (cachedScreenshot) {
					setImageSrc(cachedScreenshot.image_base64);
					setLoading(false);
					return;
				}

				// Si no existe en la base de datos, hacer una solicitud a la API
				const response = await fetch("/api/screenshoter", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ url: bookmarkURL }),
				});

				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.error || "Ocurrió un error al obtener la captura de pantalla.");
				}

				const base64 = data.data;

				// Guardar la imagen en la base de datos local
				await db.screenshot_cache.put({
					url: bookmarkURL,
					image_base64: base64,
					created_at: now,
				});

				setImageSrc(base64);
			} catch (err: any) {
				console.error("Ocurrió un error al obtener la captura de pantalla:", err);
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchScreenshot();
	}, [bookmarkURL]);

	//
	if (loading) return <LoadingBookmarkPlaceholder />;

	if (error) return <BookmarkPlaceholder bookmarkURL={bookmarkURL} bookmarkTitle={bookmarkTitle} />;

	if (!imageSrc) return <div className="screenshot-container"></div>;

	return (
		<div className="screenshot-container">
			<img
				src={imageSrc}
				alt={`Screenshot of ${bookmarkURL}`}
				style={{
					position: "relative",
					width: "100%",
					height: "100%",
					zIndex: 2,
				}}
			/>
		</div>
	);
}
