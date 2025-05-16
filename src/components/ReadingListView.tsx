// src/components/ReadingListView.tsx
interface ReadingListViewProps {
	username: string;
	isOwner: boolean;
}

export default function ReadingListView({ username, isOwner }: ReadingListViewProps) {
	return (
		<div>
			<h2>{isOwner ? "Your" : `${username}'s`} Reading List</h2>
			<p>Reading list items will go here...</p>
		</div>
	);
}
