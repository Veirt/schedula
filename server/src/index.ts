import { Hono } from "hono"
import { serveStatic } from "hono/bun"
import { cors } from "hono/cors"
import { checkRequiredVariables } from "./config/env"
import "./notifier/index"
import authRouter from "./routes/auth.route"
import oauthRouter from "./routes/oauth.route"
import scheduleRouter from "./routes/schedule.route"

checkRequiredVariables()

const app = new Hono()

app.use(
    "*",
    cors({
        origin: "*",
        credentials: true,
    }),
)

app.route("/api/schedule", scheduleRouter)
app.route("/api/auth", authRouter)
app.route("/api/oauth", oauthRouter)

app.use("*", serveStatic({ root: "./frontend" }))

export default app
