import { sqliteTable, text } from "drizzle-orm/sqlite-core"

export const accounts = sqliteTable("accounts", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    avatar: text("avatar").notNull(),
    accessToken: text("access_token").notNull(),
    refreshToken: text("refresh_token").notNull(),
})
