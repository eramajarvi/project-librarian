import { useStore } from "@nanostores/react";
import { activeView } from "../stores/activeViewStore";

import ReadingListView from "./ReadingListView";
import BookmarksView from "./BookmarksView";
import TopSitesView from "./TopSitesView";
import DefaultView from "./TopSitesView";

interface ViewManagerProps {
	username: string;
	isOwner: boolean;
}

export default function ViewManager({ username, isOwner }: ViewManagerProps) {
	const currentView = useStore(activeView);

	const renderView = () => {
		const commonProps = { username, isOwner };

		switch (currentView) {
			case "readingList":
				return <ReadingListView {...commonProps} />;
			case "bookmarks":
				return <BookmarksView {...commonProps} />;
			case "topSites":
				return <TopSitesView {...commonProps} />;
			case "default":
			default:
				return <TopSitesView username={username} />;
		}
	};

	return <main>{renderView()}</main>;
}
