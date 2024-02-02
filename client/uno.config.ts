// uno.config.ts
import { defineConfig, presetUno, presetWind } from "unocss"
import presetIcons from "@unocss/preset-icons"

export default defineConfig({
    presets: [presetWind(), presetIcons()],
    theme: {
        colors: {
            primary: "#151515",
            secondary: "#343434",
            alt: "#262626",
        },
    },
})
