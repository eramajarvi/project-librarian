import { useStore } from "@nanostores/react";
import { activeView } from "../stores/activeViewStore";
import APIManager from "./APIManager";
import { ClerkProvider } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import { useUser } from "@clerk/clerk-react";
import type { UserResource } from "@clerk/types";

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
	user?: UserResource;
}

export default function ViewManager({ username, isOwner, user }: ViewManagerProps) {
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
				return <TopSitesView {...commonProps} />;
		}
	};

	return (
		<ClerkProvider publishableKey={publishableKey} appearance={{ baseTheme: dark }}>
			<APIManager />
			<main>{renderView()}</main>
		</ClerkProvider>
	);
}
