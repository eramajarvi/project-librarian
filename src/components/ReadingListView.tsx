import "../styles/index.css";

interface ReadingListViewProps {
	username: string;
	isOwner: boolean;
}

export default function ReadingListView({ username, isOwner }: ReadingListViewProps) {
	return (
		<div className="page-layout-base">
			<div className="reading-list-container">
				<div className="glasses-dark"></div>
				<p className="reading-list-title pressed-heading">The Librarian</p>
				<div className="pressed-heading reading-disclaimer">
					<p>Una biblioteca retrofuturista para tus marcadores.</p>
					<p>Este proyecto contiene componentes de código abierto.</p>
					<p>CC BY-NC-SA 4.0 - eramajarvi 2025</p>
				</div>
			</div>
		</div>
	);
}
