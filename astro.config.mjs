// @ts-check
import { defineConfig } from "astro/config";

import node from "@astrojs/node";
import clerk from "@clerk/astro";
import react from "@astrojs/react";

import { dark } from "@clerk/themes";

import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  integrations: [
      clerk({
          appearance: {
              baseTheme: dark,
          },
      }),
      react(),
	],

  adapter: node({
      mode: "standalone",
	}),

  output: "server",

  vite: {
    plugins: [tailwindcss()],
  },
});