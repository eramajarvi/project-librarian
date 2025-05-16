import "../styles/index.css";
import BookmarksFolders from "./BookmarksFolders";
import Curve from "./TopSites-Curve";

interface TopSitesViewProps {
	username: string;
	isOwner: boolean;
}

export default function TopSitesView({ username, isOwner }: any) {
	return (
		<div>
			<BookmarksFolders />
			<Curve />
		</div>
	);
}
