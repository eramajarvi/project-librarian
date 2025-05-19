import { useStore } from "@nanostores/react";
import { activeView } from "../stores/activeViewStore";
import { ClerkProvider } from "@clerk/clerk-react";

const publishableKey = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
	throw new Error("Add your Clerk Publishable Key to the .env file");
}

import ReadingListView from "./ReadingListView";
import BookmarksView from "./BookmarksView";
import TopSitesView from "./TopSitesView";

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
				// Default to TopSitesView if no specific view is set
				return <TopSitesView {...commonProps} />;
		}
	};

	return (
		<ClerkProvider publishableKey={publishableKey}>
			<main>{renderView()}</main>;
		</ClerkProvider>
	);
}
