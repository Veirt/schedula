import { eq } from "drizzle-orm"
import db from "../.."
import type { DiscordAuthData, DiscordUserData } from "../../../types/discordOauth"
import { accounts } from "./schema"

export class AccountHandler {
    static async upsert(userData: DiscordUserData, authData: DiscordAuthData) {
        await db
            .insert(accounts)
            .values({
                id: userData.id,
                name: userData.global_name,
                avatar: userData.avatar,
                accessToken: authData.access_token,
                refreshToken: authData.refresh_token,
            })
            .onConflictDoUpdate({
                target: accounts.id,
                set: {
                    name: userData.global_name,
                    avatar: userData.avatar,
                    accessToken: authData.access_token,
                    refreshToken: authData.refresh_token,
                },
            })
    }

    static async updateUserData(userData: DiscordUserData) {
        await db
            .update(accounts)
            .set({ name: userData.global_name, avatar: userData.avatar })
            .where(eq(accounts.id, userData.id))
    }

    static async updateAuthData(id: string, authData: DiscordAuthData) {
        await db
            .update(accounts)
            .set({ accessToken: authData.access_token, refreshToken: authData.refresh_token })
            .where(eq(accounts.id, id))
    }
}
