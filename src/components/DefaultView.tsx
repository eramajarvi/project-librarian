import "../styles/index.css";

interface DefaultViewProps {
	username: string;
	// isOwner: boolean;
}

export default function DefaultView({ username }: DefaultViewProps) {
	return (
		<>
			<h1>Welcome {username}!</h1>
			{/* If Curve is now Curve.tsx: */}
			{/* <Curve /> */}
			{/* If Curve.astro remains and is handled conditionally in [username].astro,
                it won't be rendered here. */}
			<p>This is your profile's main content area.</p>
		</>
	);
}
