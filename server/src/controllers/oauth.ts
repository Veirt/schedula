import { Context } from "hono"
import { setCookie } from "hono/cookie"
import { sign } from "hono/jwt"
import {
    DISCORD_OAUTH_CLIENT_ID,
    DISCORD_OAUTH_CLIENT_SECRET,
    DISCORD_OAUTH_REDIRECT_URI,
    DISCORD_SERVER_ID,
    JWT_SECRET,
} from "../config/env"
import { Account } from "../models/Account"

export const discordCallback = async (c: Context) => {
    const code = c.req.query("code")

    let authData: { access_token: string; refresh_token: string }
    try {
        authData = await getTokens(code!)
    } catch (err) {
        console.error(`[discordCallback]: ${err}`)
        return c.json({ error: "invalid code" }, 400)
    }

    let userData: { id: string; global_name: string; avatar: string }
    try {
        userData = await getUserData(authData.access_token)
    } catch (err) {
        console.error(`[discordCallback]: ${err}`)
        return c.json({ error: "failed getting user data" }, 500)
    }

    if (!(await isUserInServer(authData.access_token))) {
        return c.json({ error: "You are not in the server. You are not allowed to use this web." }, 403)
    }

    const account = new Account({
        id: userData.id,
        name: userData.global_name,
        avatar: userData.avatar,
        access_token: authData.access_token,
        refresh_token: authData.refresh_token,
    })
    account.insertOrUpdate()

    const token = await sign({ id: account.id, name: account.name }, JWT_SECRET)
    setCookie(c, "jwt", token)
    return c.redirect(Bun.env.CLIENT_URL!)
}

export const redirectToDiscordOAuth = (c: Context) => {
    const url = new URL("https://discord.com/api/oauth2/authorize")
    url.searchParams.set("client_id", DISCORD_OAUTH_CLIENT_ID)
    url.searchParams.set("redirect_uri", DISCORD_OAUTH_REDIRECT_URI)
    url.searchParams.set("response_type", "code")
    url.searchParams.set("scope", "identify guilds")

    return c.redirect(url.toString())
}

const getTokens = async (code: string) => {
    const body = new URLSearchParams({
        client_id: DISCORD_OAUTH_CLIENT_ID,
        client_secret: DISCORD_OAUTH_CLIENT_SECRET,
        redirect_uri: DISCORD_OAUTH_REDIRECT_URI,
        grant_type: "authorization_code",
        code,
    })

    const res = await fetch("https://discord.com/api/oauth2/token", { method: "POST", body })
    const authData = await res.json()

    return authData as { access_token: string; refresh_token: string }
}

const getUserData = async (accessToken: string) => {
    const userRes = await fetch("https://discord.com/api/users/@me", {
        headers: {
            authorization: `Bearer ${accessToken}`,
        },
    })

    const userData = await userRes.json()

    return userData
}

const isUserInServer = async (accessToken: string) => {
    const userServerRes = await fetch("https://discord.com/api/users/@me/guilds", {
        headers: {
            authorization: `Bearer ${accessToken}`,
        },
    })
    const userServerData = await userServerRes.json()

    return userServerData.find((s: { id: string }) => s.id === DISCORD_SERVER_ID)
}
