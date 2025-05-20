// In APIManager.tsx

import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import type { UserResource } from "@clerk/types";
import { createPlaceholderDataDexie } from "@/lib/createPlaceholderDataDexie";

import { synchronize } from "@/lib/syncService";

import { db, type Bookmark, type Folder } from "../lib/dexie";

const LAST_SYNC_FOLDERS_KEY = "last_sync_timestamp_folders"; // Define these if not already
const LAST_SYNC_BOOKMARKS_KEY = "last_sync_timestamp_bookmarks";

function APIManager() {
	const { user, isLoaded: clerkIsLoaded } = useUser(); // Renamed for clarity
	const previousUserRef = useRef<UserResource | null | undefined>(undefined);

	// Key for localStorage to track if new user setup has been done for this user
	const getHasNewUserInitializedKey = (userId?: string) => `user_${userId}_new_user_init_v2`; // Added version

	useEffect(() => {
		const currentActualUser = user;
		const previousActualUser = previousUserRef.current;

		// Define async functions for clarity
		const performSync = async (userIdToSync: string) => {
			console.log(`APIManager: User ${userIdToSync} is authenticated. Triggering synchronization.`);
			await synchronize() // synchronize is already async
				.then(() => {
					console.log(`APIManager: Synchronization attempt for ${userIdToSync} completed.`);
				})
				.catch((err) => {
					console.error(`APIManager: Synchronization attempt for ${userIdToSync} failed:`, err);
				});
		};

		const clearUserData = async (loggedOutUserId: string) => {
			// ... (your existing clearUserData logic - ensure it's async if db ops are awaited)
			console.log(`APIManager: User ${loggedOutUserId} logged out. Clearing local data...`);
			try {
				await db.transaction("rw", db.folders, db.bookmarks, async () => {
					await db.folders.where("user_id").equals(loggedOutUserId).delete();
					await db.bookmarks.where("user_id").equals(loggedOutUserId).delete();
				});
				localStorage.removeItem(`${LAST_SYNC_FOLDERS_KEY}_${loggedOutUserId}`);
				localStorage.removeItem(`${LAST_SYNC_BOOKMARKS_KEY}_${loggedOutUserId}`);
				localStorage.removeItem(getHasNewUserInitializedKey(loggedOutUserId));
				console.log(`APIManager: Local data cleared for user ${loggedOutUserId}.`);
			} catch (error) {
				console.error(`APIManager: Error clearing user data for ${loggedOutUserId}:`, error);
			}
		};

		const performNewUserSetupAndInitialSync = async (currentUser: UserResource) => {
			const hasInitializedKey = getHasNewUserInitializedKey(currentUser.id);
			let needsPlaceholderData = false;

			if (localStorage.getItem(hasInitializedKey) !== "true") {
				const userCreatedAt = currentUser.createdAt;
				if (userCreatedAt) {
					const now = new Date();
					const differenceInSeconds = (now.getTime() - userCreatedAt.getTime()) / 1000; // Changed to seconds
					console.log(`APIManager: User ${currentUser.id}, created seconds ago: ${differenceInSeconds.toFixed(0)}`);

					if (differenceInSeconds < 120) {
						// e.g., 2 minutes window
						needsPlaceholderData = true;
					}
				} else {
					// If no createdAt, might be an older user or different Clerk setup.
					// Decide if you still want to try placeholder data or just sync.
					// For now, assume if no createdAt, it's not a "new" user for this logic.
					console.log(`APIManager: User ${currentUser.id} has no createdAt date. Skipping placeholder check.`);
				}
			}

			if (needsPlaceholderData) {
				console.log("APIManager: New user detected. Attempting to create placeholder data...");
				try {
					await createPlaceholderDataDexie(currentUser); // <<<< AWAITING THE ASYNC FUNCTION
					localStorage.setItem(hasInitializedKey, "true"); // Mark as done only after success
					console.log("APIManager: Placeholder data creation successful.");
				} catch (error) {
					console.error("APIManager: Error during createPlaceholderDataDexie:", error);
					// Decide if you still want to sync or handle this error
				}
			} else if (localStorage.getItem(hasInitializedKey) === "true") {
				console.log(`APIManager: Placeholder data already created for user ${currentUser.id}.`);
			} else {
				console.log(`APIManager: User ${currentUser.id} not eligible for placeholder data (e.g. older account).`);
			}

			// Always attempt to synchronize after placeholder check/creation attempt
			console.log(`APIManager: Proceeding to sync for user ${currentUser.id}.`);
			await performSync(currentUser.id);
		};

		// Main logic dispatcher for the effect
		const manageUserSession = async () => {
			if (!clerkIsLoaded) {
				return; // Wait for Clerk
			}

			if (currentActualUser && currentActualUser.id) {
				// User is logged IN
				if (previousActualUser && previousActualUser.id !== currentActualUser.id) {
					console.log(
						`APIManager: User changed from ${previousActualUser.id} to ${currentActualUser.id}. Clearing old data.`
					);
					await clearUserData(previousActualUser.id);
					// After clearing old user data, treat the new user as a fresh session for setup/sync
					await performNewUserSetupAndInitialSync(currentActualUser);
				} else if (!previousActualUser && currentActualUser.id) {
					// This is the initial login for this component's lifecycle OR page load with existing session
					console.log(`APIManager: User ${currentActualUser.id} session active. Performing setup and/or sync.`);
					await performNewUserSetupAndInitialSync(currentActualUser);
				} else if (previousActualUser && previousActualUser.id === currentActualUser.id) {
					// User is the same, Clerk might have just re-confirmed `isLoaded` or user object reference changed.
					// Typically, a regular sync is already handled by periodic timers or other events.
					// You might decide if an immediate sync is needed here or rely on other triggers.
					// For simplicity, if this useEffect re-runs with same user, we could skip an *extra* sync
					// if placeholder logic is already done. Let's make `performNewUserSetupAndInitialSync` handle it.
					// However, if `user` object reference changes (even if id is same), it's safer to re-evaluate.
					// The `performNewUserSetupAndInitialSync` will check localStorage for placeholder init.
					console.log(`APIManager: User ${currentActualUser.id} session re-confirmed. Re-evaluating setup/sync.`);
					await performNewUserSetupAndInitialSync(currentActualUser);
				}
			} else if (!currentActualUser && previousActualUser && previousActualUser.id) {
				// User logged OUT
				await clearUserData(previousActualUser.id);
			} else if (!currentActualUser) {
				console.log("APIManager: No user signed in. Skipping operations.");
			}
		};

		manageUserSession().catch((error) => {
			console.error("APIManager: Error in manageUserSession:", error);
		});

		// Update previousUserRef at the end for the next run
		previousUserRef.current = currentActualUser;
	}, [clerkIsLoaded, user]); // Dependencies

	return null;
}

export default APIManager;
