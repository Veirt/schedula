import { Context } from "hono"
import { setCookie } from "hono/cookie"
import { getDiscordUserData, refreshDiscordAccessToken } from "../helpers/oauth.helper"
import { AccountHandler } from "../db/schema/accounts/handler"

export const getMyAccount = async (c: Context) => {
    const payload = c.get("jwtPayload")

    const account = await AccountHandler.getByid(payload.id)

    if (!account) {
        return c.json({ error: "Unauthorized" }, 401)
    }

    try {
        const userData = await getDiscordUserData(account.accessToken)
        if (userData.message === "401: Unauthorized") {
            throw new Error("401: Unauthorized")
        }

        AccountHandler.updateUserData(userData)
    } catch (_err) {
        const authData = await refreshDiscordAccessToken(account.refreshToken)
        if (!authData.error) AccountHandler.updateAuthData(account.id, authData)
    }

    return c.json({
        data: {
            account: {
                id: account.id,
                name: account.name,
                avatar: account.avatar,
            },
        },
    })
}

export const logOut = (c: Context) => {
    setCookie(c, "jwt", "", { maxAge: 0 })

    return c.json({ sucess: true }, 200)
}
