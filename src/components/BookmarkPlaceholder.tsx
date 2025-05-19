import "../styles/index.css";

import React from "react";
import PlaceholderGradient from "../assets/SnapshotPlaceholderGradient.png";

interface BookmarkPlaceholderProps {
	bookmarkURL: string;
	bookmarkTitle: string;
}

const BookmarkPlaceholder: React.FC<BookmarkPlaceholderProps> = ({ bookmarkURL, bookmarkTitle }) => (
	<div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", width: "100%" }}>
		<img
			src={PlaceholderGradient.src}
			alt="Background placeholder"
			style={{
				position: "absolute",
				top: 0,
				left: 0,
				width: "100%",
				height: "100%",
				objectFit: "cover",
				zIndex: 1,
			}}
		/>
		<div className="bookmark-text-container">
			<p className="bookmark-title">{bookmarkTitle}</p>
			<a className="bookmark-url" href={bookmarkURL} target="_blank" rel="noopener noreferrer">
				{bookmarkURL.replace(/^https?:\/\//, "").length > 40
					? bookmarkURL.replace(/^https?:\/\//, "").slice(0, 40) + "..."
					: bookmarkURL.replace(/^https?:\/\//, "")}
			</a>
		</div>
	</div>
);

export default BookmarkPlaceholder;
