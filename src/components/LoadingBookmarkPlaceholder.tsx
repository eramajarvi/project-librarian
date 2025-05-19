import "../styles/index.css";

import React from "react";
import PlaceholderGradient from "../assets/SnapshotPlaceholderGradient.png";

const LoadingBookmarkPlaceholder: React.FC = () => (
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
		<img
			src="/assets/ReaderSpinner.png"
			alt="Foreground placeholder"
			style={{
				position: "relative",
				width: "16px",
				height: "16px",
				animation: "spin 1s linear infinite",
				filter: "invert(1)",
				zIndex: 2,
			}}
		/>
	</div>
);

export default LoadingBookmarkPlaceholder;
