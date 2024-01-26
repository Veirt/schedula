import { Hono } from "hono"
import { discordCallback, redirectToDiscordOAuth } from "../controllers/oauth.controller"

// /oauth
const oauthRouter = new Hono()

oauthRouter.get("/discord", redirectToDiscordOAuth)
oauthRouter.get("/discord/callback", discordCallback)

export default oauthRouter
