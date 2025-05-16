import Dexie, { type Table } from "dexie";

export interface Bookmark {
	id: string;
	folder_id: number;
	url: string;
	title: string;
	created_at: number;
	sync_status: "pending" | "synced" | "error";
}

export interface BookmarksFolder {
	id: string;
}

class LibrarianDatabase extends Dexie {
	bookmarks!: Table<Bookmark>;

	constructor() {
		super("LocalDB");
		this.version(1).stores({
			bookmarks: "id, createdAt, syncStatus", // Indexes
		});
	}
}

export const db = new LibrarianDatabase();
