// src/env.d.ts
/// <reference types="astro/client" />

interface ImportMetaEnv {
	readonly PUBLIC_CLERK_PUBLISHABLE_KEY: string;
	readonly CLERK_SECRET_KEY: string;
	readonly PUBLIC_CLERK_SIGN_IN_URL?: string;
	readonly PUBLIC_CLERK_SIGN_UP_URL?: string;
	readonly PUBLIC_CLERK_AFTER_SIGN_IN_URL?: string;
	readonly PUBLIC_CLERK_AFTER_SIGN_UP_URL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
