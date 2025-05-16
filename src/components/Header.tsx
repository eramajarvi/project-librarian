import "../styles/index.css";
import { SignedIn, UserButton } from "@clerk/astro/react";

import GlassesIcon from "../assets/toolbar/ReadingList-Glasses.png";
import BookmarksIcon from "../assets/toolbar/ToolbarBookmarksTemplate.png";
import TopSitesIcon from "../assets/toolbar/ToolbarTopSitesTemplate.png";

import { useStore } from "@nanostores/react";
import {
	activeView,
	showReadingList,
	showBookmarks,
	showTopSites,
	showDefaultView,
	type ViewName,
} from "../stores/activeViewStore";

export default function Header() {
	const currentView = useStore(activeView);
	console.log("Current active view in Header:", currentView);

	const handleLogoClick = () => {
		showTopSites();
	};

	const getButtonClasses = (buttonView: ViewName, baseClasses: string): string => {
		const isActive = currentView === buttonView;
		console.log(`Button: ${buttonView}, IsActive: ${isActive}`); // <-- Optional more detailed debug
		return `${baseClasses} ${isActive ? "active" : ""}`;
	};

	return (
		<>
			<header className="header">
				<div>
					<div className="toolbar">
						<div className="icon-button-container ">
							<button
								className={getButtonClasses("readingList", "icon-button glasses-button")}
								aria-label="Reading List"
								onClick={showReadingList}
								aria-pressed={currentView === "readingList"}>
								<img src={GlassesIcon.src} alt="Reading List" />
							</button>
						</div>

						<div className="icon-button-container">
							<button
								className={getButtonClasses("bookmarks", "icon-button bookmarks-button")}
								aria-label="Bookmarks List"
								onClick={showBookmarks}
								aria-pressed={currentView === "bookmarks"}>
								<img src={BookmarksIcon.src} alt="Reading List" />
							</button>
						</div>

						<div className="icon-button-container">
							<button
								className={getButtonClasses("topSites", "icon-button topsites-button")}
								aria-label="Top Sites List"
								onClick={showTopSites}
								aria-pressed={currentView === "topSites"}>
								<img src={TopSitesIcon.src} alt="Reading List" />
							</button>
						</div>
					</div>
				</div>

				<div className="title-container" onClick={handleLogoClick} style={{ cursor: "pointer" }}>
					<img src="/assets/thelibrarianicon.svg" />
					<p>The Librarian</p>
				</div>

				<div className="clerk-user-container">
					<SignedIn>
						<UserButton showName />
					</SignedIn>
				</div>
			</header>
		</>
	);
}
