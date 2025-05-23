import "../styles/index.css";

import React from "react";
import PlaceholderGradient from "../assets/SnapshotPlaceholderGradient.png";
import PlaceholderCompass from "../assets/SnapshotPlaceholderCompass.png";

interface EmptyBookmarkPlaceholderProps {
	onAddBookmarkClick: () => void;
}

const EmptyBookmarkPlaceholder: React.FC<EmptyBookmarkPlaceholderProps> = ({ onAddBookmarkClick }) => {
	return (
		<div
			style={{
				position: "relative",
				width: "100%",
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				cursor: "pointer",
			}}
			onClick={onAddBookmarkClick}
			role="button"
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") onAddBookmarkClick();
			}}>
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
				src={PlaceholderCompass.src}
				alt="Foreground placeholder"
				style={{
					position: "relative",
					width: "120px",
					height: "120px",
					zIndex: 2,
				}}
			/>
		</div>
	);
};

export default EmptyBookmarkPlaceholder;
