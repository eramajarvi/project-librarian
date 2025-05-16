import "../styles/index.css";
import { useStore } from "@nanostores/react";
import { $userStore } from "@clerk/astro/client";

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/astro/react";

export default function Header() {
	return (
		<>
			<header className="header">
				<div>
					<div className="toolbar">
						<div className="icon-button-container">
							<button className="icon-button glasses-button" aria-label="Reading List"></button>
						</div>

						<div className="icon-button-container">
							<button className="icon-button bookmarks-button" aria-label="Bookmarks List"></button>
						</div>

						<div className="icon-button-container">
							<button className="icon-button topsites-button" aria-label="Top Sites List"></button>
						</div>
					</div>
				</div>
				<div>
					<SignedIn>
						<UserButton showName />
					</SignedIn>
				</div>
			</header>
		</>
	);
}
