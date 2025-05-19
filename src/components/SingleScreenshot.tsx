import { useEffect, useState } from "react";

interface SingleScreenshotProps {
	targetUrl: string;
}

export default function SingleScreenshot({ targetUrl }: SingleScreenshotProps) {
	const [imageSrc, setImageSrc] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// If no targetUrl is provided, don't attempt to fetch
		if (!targetUrl) {
			setLoading(false);
			setError("No URL provided to screenshot.");
			return;
		}

		const fetchScreenshot = async () => {
			setLoading(true); // Reset loading state for new URL
			setError(null); // Reset error state
			setImageSrc(null); // Reset image source

			try {
				const response = await fetch("/api/screenshoter", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ url: targetUrl }),
				});

				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.error || "Ocurrió un error al obtener la captura de pantalla.");
				}

				setImageSrc(data.data || null);
			} catch (err: any) {
				console.error("Ocurrió un error al obtener la captura de pantalla:", err);
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchScreenshot();
	}, [targetUrl]);

	//
	if (loading) return <p>Loading screenshot for {targetUrl}...</p>;
	if (error)
		return (
			<p>
				Error fetching screenshot for {targetUrl}: {error}
			</p>
		);
	if (!imageSrc) return <p>No screenshot available for {targetUrl}.</p>;

	return (
		<div className="flex flex-col items-center gap-4">
			<img src={imageSrc} alt={`Screenshot of ${targetUrl}`} />
		</div>
	);
}
