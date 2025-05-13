import { useStore } from "@nanostores/react";
import { $userStore } from "@clerk/astro/client";

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/astro/react";

export default function Header() {
	return (
		<>
			<SignedIn>
				<UserButton showName />
			</SignedIn>
		</>
	);
}
