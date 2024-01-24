import { Hono } from "hono"
import { cors } from "hono/cors"
import { CLIENT_URL, checkRequiredVariables } from "./config/env"
import { Account } from "./models/Account"
import { Schedule } from "./models/Schedule"
import { ScheduleChange } from "./models/ScheduleChanges"
import authRouter from "./routes/auth"
import oauthRouter from "./routes/oauth"
import scheduleRouter from "./routes/schedule"

checkRequiredVariables()

const app = new Hono()
if (process.env.NODE_ENV === "development") {
    app.use("/api/*", cors())
} else {
    app.use("/api/*", cors({ credentials: true, origin: CLIENT_URL }))
}

Schedule.init()
ScheduleChange.init()
Account.init()

app.route("/api/schedule", scheduleRouter)
app.route("/api/auth", authRouter)
app.route("/api/oauth", oauthRouter)

export default app
