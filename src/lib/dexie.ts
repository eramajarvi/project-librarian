import Dexie, { type Table } from "dexie";

export interface Bookmark {
	bookmark_id: string;
	user_id: string;
	folder_id: string;
	url: string;
	title: string;
	created_at: number;
	updated_at: number;
	sync_status: "new" | "modified" | "deleted_local" | "synced" | "error";
	is_deleted?: boolean;
}

export interface Folder {
	folder_id: string;
	server_id?: number;
	user_id: string;
	folder_name: string;
	folder_emoji: string;
	created_at: number;
	updated_at: number;
	sync_status: "new" | "modified" | "deleted_local" | "synced" | "error";
	is_deleted?: boolean;
}

export interface ScreenshotCache {
	url: string;
	image_base64: string;
	created_at: string;
}

class LibrarianDatabase extends Dexie {
	bookmarks!: Table<Bookmark, string>;
	folders!: Table<Folder, string>;
	screenshot_cache!: Table<ScreenshotCache, string>;

	constructor() {
		super("LocalLibrarianDB");
		this.version(1).stores({
			bookmarks: "bookmark_id, user_id, folder_id, updated_at, sync_status, is_deleted",
			folders: "folder_id, &server_id, user_id, updated_at, sync_status, is_deleted",
			screenshot_cache: "url, image_base64, created_at",
		});
	}
}

export const db = new LibrarianDatabase();
