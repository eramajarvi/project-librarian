import "../styles/index.css";
import Curve from "./TopSites-Curve";

interface TopSitesViewProps {
	username: string;
	isOwner: boolean;
}

export default function TopSitesView({ username, isOwner }: any) {
	return (
		<div>
			<p>Top sites items will go here...</p>
			<Curve />
		</div>
	);
}
