import { db, type Bookmark, type Folder } from "./dexie";
import type { UserResource } from "@clerk/types";

export async function createPlaceholderDataDexie(user: UserResource) {
	const nowHolder = Date.now();
	const now = new Date(nowHolder).toISOString();

	if (!user) {
		console.error("User not found");
		return;
	}

	const placeholderFolders: Folder[] = [
		{
			folder_id: crypto.randomUUID(),
			user_id: user.id,
			folder_name: "general",
			folder_emoji: "📂",
			created_at: Date.now(),
			updated_at: Date.now(),
			sync_status: "new",
		},
		{
			folder_id: crypto.randomUUID(),
			user_id: user.id,
			folder_name: "herramientas",
			folder_emoji: "🛠️",
			created_at: Date.now(),
			updated_at: Date.now(),
			sync_status: "new",
		},
		{
			folder_id: crypto.randomUUID(),
			user_id: user.id,
			folder_name: "componentes",
			folder_emoji: "🧩",
			created_at: Date.now(),
			updated_at: Date.now(),
			sync_status: "new",
		},
		{
			folder_id: crypto.randomUUID(),
			user_id: user.id,
			folder_name: "portafolios",
			folder_emoji: "✨",
			created_at: Date.now(),
			updated_at: Date.now(),
			sync_status: "new",
		},
	];

	const placeholderBookmarksGeneral: Bookmark[] = [
		// Marcadores para la carpeta "general"
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[0].folder_id,
			url: "https://midu.dev/",
			title: "Midudev",
			created_at: Date.now(),
			updated_at: Date.now(),
			sync_status: "new",
		},
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[0].folder_id,
			url: "https://clerk.com/",
			title: "Clerk",
			created_at: Date.now(),
			updated_at: Date.now(),
			sync_status: "new",
		},
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[0].folder_id,
			url: "https://neocities.org/",
			title: "Neocities",
			created_at: Date.now(),
			updated_at: Date.now(),
			sync_status: "new",
		},
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[0].folder_id,
			url: "https://literal.club/",
			title: "Literal.club",
			created_at: Date.now(),
			updated_at: Date.now(),
			sync_status: "new",
		},
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[0].folder_id,
			url: "https://esoteric.codes/",
			title: "esoteric.codes",
			created_at: Date.now(),
			updated_at: Date.now(),
			sync_status: "new",
		},
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[0].folder_id,
			url: "https://poetic.computer/",
			title: "poetic.computer",
			created_at: Date.now(),
			updated_at: Date.now(),
			sync_status: "new",
		},
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[0].folder_id,
			url: "https://chartdb.io/",
			title: "ChartDB",
			created_at: Date.now(),
			updated_at: Date.now(),
			sync_status: "new",
		},
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[0].folder_id,
			url: "https://publicapis.dev/",
			title: "Public APIs",
			created_at: Date.now(),
			updated_at: Date.now(),
			sync_status: "new",
		},
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[0].folder_id,
			url: "https://onedollarstats.com/",
			title: "One Dollar Stats",
			created_at: Date.now(),
			updated_at: Date.now(),
			sync_status: "new",
		},
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[0].folder_id,
			url: "https://lenis.darkroom.engineering/",
			title: "Lenis",
			created_at: Date.now(),
			updated_at: Date.now(),
			sync_status: "new",
		},
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[0].folder_id,
			url: "https://www.awwwards.com/websites/",
			title: "Awwwards",
			created_at: Date.now(),
			updated_at: Date.now(),
			sync_status: "new",
		},
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[0].folder_id,
			url: "https://www.twitch.tv/midudev",
			title: "Twitch Midudev",
			created_at: Date.now(),
			updated_at: Date.now(),
			sync_status: "new",
		},
	];

	const placeholderBookmarksTools: Bookmark[] = [
		// Marcadores para la carpeta "herramientas"
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[1].folder_id,
			url: "https://www.realtimecolors.com/?",
			title: "Realtime Colors",
			created_at: Date.now(),
			updated_at: Date.now(),
			sync_status: "new",
		},
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[1].folder_id,
			url: "https://www.manim.community/",
			title: "Manim",
			created_at: Date.now(),
			updated_at: Date.now(),
			sync_status: "new",
		},
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[1].folder_id,
			url: "https://cssgridgenerator.io/",
			title: "CSS Grid Generator",
			created_at: Date.now(),
			updated_at: Date.now(),
			sync_status: "new",
		},
	];

	const placeholderBookmarksComponents: Bookmark[] = [
		// Marcadores para la carpeta "componentes"
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[2].folder_id,
			url: "https://originui.com/",
			title: "Origin UI",
			created_at: Date.now(),
			updated_at: Date.now(),
			sync_status: "new",
		},
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[2].folder_id,
			url: "https://www.reactbits.dev/",
			title: "React Bits",
			created_at: Date.now(),
			updated_at: Date.now(),
			sync_status: "new",
		},
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[2].folder_id,
			url: "https://www.fancycomponents.dev/",
			title: "Fancy Components",
			created_at: Date.now(),
			updated_at: Date.now(),
			sync_status: "new",
		},
	];

	const placeholderBookmarksPortfolios: Bookmark[] = [
		// Marcadores para la carpeta "fortafolios"
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[3].folder_id,
			url: "https://lauren-mccarthy.com/",
			title: "Lauren Lee",
			created_at: Date.now(),
			updated_at: Date.now(),
			sync_status: "new",
		},
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[3].folder_id,
			url: "https://prettyfolio.com/",
			title: "Prettyfolio",
			created_at: Date.now(),
			updated_at: Date.now(),
			sync_status: "new",
		},
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[3].folder_id,
			url: "https://onur.dev/bookmarks/portfolio",
			title: "Onur Şuyalçınkaya",
			created_at: Date.now(),
			updated_at: Date.now(),
			sync_status: "new",
		},
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[3].folder_id,
			url: "https://pheralb.dev/",
			title: "Pablo Hernández",
			created_at: Date.now(),
			updated_at: Date.now(),
			sync_status: "new",
		},
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[3].folder_id,
			url: "https://eramajarvi.com/",
			title: "James Perez",
			created_at: Date.now(),
			updated_at: Date.now(),
			sync_status: "new",
		},
	];

	await db.folders.bulkPut(placeholderFolders);
	await db.bookmarks.bulkPut(placeholderBookmarksGeneral);
	await db.bookmarks.bulkPut(placeholderBookmarksTools);
	await db.bookmarks.bulkPut(placeholderBookmarksComponents);
	await db.bookmarks.bulkPut(placeholderBookmarksPortfolios);
}
