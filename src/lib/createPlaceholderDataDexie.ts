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
			created_at: now,
			updated_at: now,
			sync_status: "pending",
		},
		{
			folder_id: crypto.randomUUID(),
			user_id: user.id,
			folder_name: "herramientas",
			folder_emoji: "🛠️",
			created_at: now,
			updated_at: now,
			sync_status: "pending",
		},
		{
			folder_id: crypto.randomUUID(),
			user_id: user.id,
			folder_name: "componentes",
			folder_emoji: "🧩",
			created_at: now,
			updated_at: now,
			sync_status: "pending",
		},
		{
			folder_id: crypto.randomUUID(),
			user_id: user.id,
			folder_name: "portafolios",
			folder_emoji: "✨",
			created_at: now,
			updated_at: now,
			sync_status: "pending",
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
			created_at: now,
			updated_at: now,
			sync_status: "pending",
		},
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[0].folder_id,
			url: "https://clerk.com/",
			title: "Clerk",
			created_at: now,
			updated_at: now,
			sync_status: "pending",
		},
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[0].folder_id,
			url: "https://neocities.org/",
			title: "Neocities",
			created_at: now,
			updated_at: now,
			sync_status: "pending",
		},
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[0].folder_id,
			url: "https://literal.club/",
			title: "Literal.club",
			created_at: now,
			updated_at: now,
			sync_status: "pending",
		},
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[0].folder_id,
			url: "https://esoteric.codes/",
			title: "esoteric.codes",
			created_at: now,
			updated_at: now,
			sync_status: "pending",
		},
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[0].folder_id,
			url: "https://poetic.computer/",
			title: "poetic.computer",
			created_at: now,
			updated_at: now,
			sync_status: "pending",
		},
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[0].folder_id,
			url: "https://chartdb.io/",
			title: "ChartDB",
			created_at: now,
			updated_at: now,
			sync_status: "pending",
		},
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[0].folder_id,
			url: "https://publicapis.dev/",
			title: "Public APIs",
			created_at: now,
			updated_at: now,
			sync_status: "pending",
		},
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[0].folder_id,
			url: "https://onedollarstats.com/",
			title: "One Dollar Stats",
			created_at: now,
			updated_at: now,
			sync_status: "pending",
		},
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[0].folder_id,
			url: "https://lenis.darkroom.engineering/",
			title: "Lenis",
			created_at: now,
			updated_at: now,
			sync_status: "pending",
		},
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[0].folder_id,
			url: "https://www.awwwards.com/websites/",
			title: "Awwwards",
			created_at: now,
			updated_at: now,
			sync_status: "pending",
		},
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[0].folder_id,
			url: "https://www.twitch.tv/midudev",
			title: "Twitch Midudev",
			created_at: now,
			updated_at: now,
			sync_status: "pending",
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
			created_at: now,
			updated_at: now,
			sync_status: "pending",
		},
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[1].folder_id,
			url: "https://www.manim.community/",
			title: "Manim",
			created_at: now,
			updated_at: now,
			sync_status: "pending",
		},
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[1].folder_id,
			url: "https://cssgridgenerator.io/",
			title: "CSS Grid Generator",
			created_at: now,
			updated_at: now,
			sync_status: "pending",
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
			created_at: now,
			updated_at: now,
			sync_status: "pending",
		},
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[2].folder_id,
			url: "https://www.reactbits.dev/",
			title: "React Bits",
			created_at: now,
			updated_at: now,
			sync_status: "pending",
		},
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[2].folder_id,
			url: "https://www.fancycomponents.dev/",
			title: "Fancy Components",
			created_at: now,
			updated_at: now,
			sync_status: "pending",
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
			created_at: now,
			updated_at: now,
			sync_status: "pending",
		},
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[3].folder_id,
			url: "https://prettyfolio.com/",
			title: "Prettyfolio",
			created_at: now,
			updated_at: now,
			sync_status: "pending",
		},
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[3].folder_id,
			url: "https://onur.dev/bookmarks/portfolio",
			title: "Onur Şuyalçınkaya",
			created_at: now,
			updated_at: now,
			sync_status: "pending",
		},
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[3].folder_id,
			url: "https://pheralb.dev/",
			title: "Pablo Hernández",
			created_at: now,
			updated_at: now,
			sync_status: "pending",
		},
		{
			bookmark_id: crypto.randomUUID(),
			user_id: user.id,
			folder_id: placeholderFolders[3].folder_id,
			url: "https://eramajarvi.com/",
			title: "James Perez",
			created_at: now,
			updated_at: now,
			sync_status: "pending",
		},
	];

	await db.folders.bulkPut(placeholderFolders);
	await db.bookmarks.bulkPut(placeholderBookmarksGeneral);
	await db.bookmarks.bulkPut(placeholderBookmarksTools);
	await db.bookmarks.bulkPut(placeholderBookmarksComponents);
	await db.bookmarks.bulkPut(placeholderBookmarksPortfolios);
}
