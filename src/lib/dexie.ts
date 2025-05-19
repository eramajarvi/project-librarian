import Dexie, { type Table } from "dexie";

export interface Bookmark {
	bookmark_id: string;
	user_id: string;
	folder_id: string;
	url: string;
	title: string;
	created_at: string;
	updated_at: string;
	sync_status: "pending" | "synced" | "error";
}

export interface Folder {
	folder_id: string;
	user_id: string;
	folder_name: string;
	folder_emoji: string;
	created_at: string;
	updated_at: string;
	sync_status: "pending" | "synced" | "error";
}

export interface ScreenshotCache {
	url: string;
	image_base64: string;
	created_at: string;
}

class LibrarianDatabase extends Dexie {
	bookmarks!: Table<Bookmark>;
	folders!: Table<Folder>;
	screenshot_cache!: Table<ScreenshotCache>;

	constructor() {
		super("LocalLibrarianDB");
		this.version(1).stores({
			bookmarks: "bookmark_id, user_id, folder_id, url, title, created_at, updated_at, sync_status",
			folders: "folder_id, user_id, folder_name, folder_emoji, created_at, updated_at, sync_status",
			screenshot_cache: "url, image_base64, created_at",
		});
	}
}

export const db = new LibrarianDatabase();
