import { Hono } from "hono"
import { cors } from "hono/cors"
import { checkRequiredVariables } from "./config/env"
import { Account } from "./models/Account"
import { Schedule } from "./models/Schedule"
import authRouter from "./routes/auth"
import oauthRouter from "./routes/oauth"
import scheduleRouter from "./routes/schedule"

checkRequiredVariables()

const app = new Hono()
app.use("/api/*", cors())

Schedule.init()
Account.init()

app.route("/api/schedule", scheduleRouter)
app.route("/api/auth", authRouter)
app.route("/oauth", oauthRouter)

export default app
