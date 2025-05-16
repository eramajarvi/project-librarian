import { atom } from "nanostores";

export type ViewName = "readingList" | "bookmarks" | "topSites" | "default";

export const activeView = atom<ViewName>("topSites");

export const showReadingList = () => activeView.set("readingList");
export const showBookmarks = () => activeView.set("bookmarks");
export const showTopSites = () => activeView.set("topSites");
export const showDefaultView = () => activeView.set("default");
