import { Hono } from "hono"
import { serve } from "@hono/node-server"
import { checkRequiredVariables } from "./config/env"
import authRouter from "./routes/auth.route"
import oauthRouter from "./routes/oauth.route"
import scheduleRouter from "./routes/schedule.route"

checkRequiredVariables()

const app = new Hono()

app.route("/api/schedule", scheduleRouter)
app.route("/api/auth", authRouter)
app.route("/api/oauth", oauthRouter)

serve(app, (info) => {
    console.log(`Listening on http://localhost:${info.port}`) // Listening on http://localhost:3000
})
