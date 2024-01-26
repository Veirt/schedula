export function checkRequiredVariables() {
    const requiredVariables = [
        "DISCORD_OAUTH_CLIENT_ID",
        "DISCORD_OAUTH_CLIENT_SECRET",
        "DISCORD_OAUTH_REDIRECT_URI",
        "DISCORD_SERVER_ID",
        "JWT_SECRET",
    ]
    for (const variable of requiredVariables) {
        if (!Bun.env[variable]) {
            throw Error(`Error: Environment variable ${variable} is not set.`)
        }
    }
}

export const DISCORD_OAUTH_CLIENT_ID = Bun.env.DISCORD_OAUTH_CLIENT_ID!
export const DISCORD_OAUTH_CLIENT_SECRET = Bun.env.DISCORD_OAUTH_CLIENT_SECRET!
export const DISCORD_OAUTH_REDIRECT_URI = Bun.env.DISCORD_OAUTH_REDIRECT_URI!
export const DISCORD_SERVER_ID = Bun.env.DISCORD_SERVER_ID!
export const JWT_SECRET = Bun.env.JWT_SECRET!
