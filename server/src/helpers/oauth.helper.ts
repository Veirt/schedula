import { DISCORD_OAUTH_CLIENT_ID, DISCORD_OAUTH_CLIENT_SECRET, DISCORD_OAUTH_REDIRECT_URI } from "../config/env"

export const getDiscordUserData = async (accessToken: string) => {
    const userRes = await fetch("https://discord.com/api/users/@me", {
        headers: {
            authorization: `Bearer ${accessToken}`,
        },
    })

    const userData = await userRes.json()

    return userData
}

export const refreshDiscordAccessToken = async (refreshToken: string) => {
    const res = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        body: new URLSearchParams({
            client_id: DISCORD_OAUTH_CLIENT_ID,
            client_secret: DISCORD_OAUTH_CLIENT_SECRET,
            refresh_token: refreshToken,
            grant_type: "refresh_token",
        }),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    })

    const data = await res.json()

    return data
}
