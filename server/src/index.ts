import { Hono } from "hono"
import { checkRequiredVariables } from "./config/env"
import { Account } from "./models/Account.model"
import { Schedule } from "./models/Schedule.model"
import { ScheduleChange } from "./models/ScheduleChange.model"
import authRouter from "./routes/auth.route"
import oauthRouter from "./routes/oauth.route"
import scheduleRouter from "./routes/schedule.route"

checkRequiredVariables()

const app = new Hono()

Schedule.init()
ScheduleChange.init()
Account.init()

app.route("/api/schedule", scheduleRouter)
app.route("/api/auth", authRouter)
app.route("/api/oauth", oauthRouter)

export default app
