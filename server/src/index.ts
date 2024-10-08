import { Hono } from "hono"
import { cors } from "hono/cors"
import { checkRequiredVariables } from "./config/env"
import oauthRouter from "./routes/oauth.route"
import scheduleRouter from "./routes/schedule.route"
import "./notifier/index"
import authRouter from "./routes/auth.route"

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

export default app
