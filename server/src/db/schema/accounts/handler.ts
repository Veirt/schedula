import { eq } from "drizzle-orm"
import db from "../.."
import type { DiscordAuthData, DiscordUserData } from "../../../types/discordOauth"
import { accounts } from "./schema"

export class AccountHandler {
    static async getByid(id: string) {
        // somehow doesn't work in bun as of 2024-02-04
        // const account = await db.query.accounts.findFirst({
        //     where: (accounts, { eq }) => eq(accounts.id, payload.id),
        // })

        const accountRes = await db.select().from(accounts).where(eq(accounts.id, id)).limit(1)
        if (accountRes.length === 0) {
            return undefined
        }

        const account = accountRes[0]
        return account
    }

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
