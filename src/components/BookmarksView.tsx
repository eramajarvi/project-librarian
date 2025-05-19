import "../styles/index.css";
import { ClerkProvider } from "@clerk/clerk-react";
import TestTurso from "./test-turso";
import SingleScreenshot from "./SingleScreenshot";

const publishableKey = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
	throw new Error("Add your Clerk Publishable Key to the .env file");
}

interface BookmarksViewProps {
	username: string;
	isOwner: boolean;
}

export default function BookmarksView({ username, isOwner }: any) {
	return (
		<ClerkProvider publishableKey={publishableKey}>
			<div>
				<h2>{isOwner ? "Your" : `${username}'s`} Bookmarks</h2>
				<p>Bookmarks items will go here...</p>
				{/* <TestTurso /> */}
				<SingleScreenshot targetUrl="https://www.google.com/" />
			</div>
		</ClerkProvider>
	);
}
