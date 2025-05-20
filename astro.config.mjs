// @ts-check
import { defineConfig } from "astro/config";

import node from "@astrojs/node";
import clerk from "@clerk/astro";
import react from "@astrojs/react";

import { dark } from "@clerk/themes";
import { esMX } from "@clerk/localizations";

import tailwindcss from "@tailwindcss/vite";

import vercel from "@astrojs/vercel";

export default defineConfig({
    integrations: [
        clerk({
            localization: esMX,
            appearance: {
                baseTheme: dark,
            },
        }),
        react(),
    ],

    adapter: vercel(),

    output: "server",

    vite: {
        plugins: [tailwindcss()],
    },
});