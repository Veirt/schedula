// vite.config.ts
import { defineConfig } from "vite"
import { sveltekit } from "@sveltejs/kit/vite"
import UnoCSS from "@unocss/svelte-scoped/vite"

export default defineConfig({
    plugins: [
        UnoCSS({
            injectReset: "@unocss/reset/tailwind.css", // see type definition for all included reset options or how to pass in your own
            // ...other Svelte Scoped options
        }),
        sveltekit(),
    ],
    server: {
        proxy: {
            "/api": {
                target: "http://localhost:3000",
                changeOrigin: true,
            },
        },
    },
})
