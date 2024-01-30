import type { Config } from "drizzle-kit"

export default {
    schema: "./src/db/**/schema.ts",
    out: "./drizzle",
    driver: "better-sqlite", // 'pg' | 'mysql2' | 'better-sqlite' | 'libsql' | 'turso'
    dbCredentials: { url: "./db/db.sqlite" },
} satisfies Config
