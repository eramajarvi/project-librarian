import "../styles/index.css";

interface BookmarksViewProps {
	username: string;
	isOwner: boolean;
}

export default function BookmarksView({ username, isOwner }: any) {
	return (
		<div>
			<h2>{isOwner ? "Your" : `${username}'s`} Bookmarks</h2>
			<p>Bookmarks items will go here...</p>
		</div>
	);
}
