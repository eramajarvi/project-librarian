import "../styles/index.css";
import "../styles/singleScreenshot.css";

import React, { useEffect, useState, useRef } from "react"; // Added useRef
import { db } from "../lib/dexie";

import LoadingBookmarkPlaceholder from "./LoadingBookmarkPlaceholder";
import BookmarkPlaceholder from "./BookmarkPlaceholder";

interface ScreenshotCacheEntry {
	url: string;
	image_base64: string;
	created_at: string;
}

interface SingleScreenshotProps {
	bookmarkURL: string;
	bookmarkTitle: string;
}

// Make sure your Dexie definition includes this table
// Example:
// db.version(X).stores({
//   ...,
//   screenshot_cache: 'url, created_at' // 'url' is primary key
// });
// Add screenshot_cache to your Dexie class:
// screenshot_cache!: Table<ScreenshotCacheEntry, string>;

export default function SingleScreenshot({ bookmarkURL, bookmarkTitle }: SingleScreenshotProps) {
	// Your existing state for fetching/caching
	const [imageSrc, setImageSrc] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const nowHolder = Date.now();
	const now = new Date(nowHolder).toISOString();

	// State for zoom functionality
	const [isZoomed, setIsZoomed] = useState(false);
	const screenshotContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!bookmarkURL) {
			setLoading(false);
			setError("No URL provided to screenshot.");
			return;
		}

		const fetchScreenshot = async () => {
			setLoading(true);
			setError(null);
			setImageSrc(null);

			try {
				const cachedScreenshot = await db.screenshot_cache.get(bookmarkURL);
				if (cachedScreenshot) {
					setImageSrc(cachedScreenshot.image_base64);
					setLoading(false);
					return;
				}

				const response = await fetch("/api/screenshoter", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ url: bookmarkURL }),
				});

				const data = await response.json();
				if (!response.ok) {
					throw new Error(data.error || "Ocurrió un error al obtener la captura de pantalla.");
				}
				const base64 = data.data;
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

	if (loading) return <LoadingBookmarkPlaceholder />;
	if (error) return <BookmarkPlaceholder bookmarkURL={bookmarkURL} bookmarkTitle={bookmarkTitle} />;
	if (!imageSrc) {
		return <div className="single-screenshot-container placeholder-empty" title="No preview available"></div>;
	}

	return (
		<>
			<div ref={screenshotContainerRef} className="single-screenshot-container" title={bookmarkTitle}>
				<div className="screenshot-image-wrapper">
					<img src={imageSrc} alt={`Screenshot of ${bookmarkTitle}`} className="screenshot-actual-image" />
				</div>

				<div className="bookmark-info-overlay">
					<span>{bookmarkTitle}</span>
				</div>
			</div>
		</>
	);
}
