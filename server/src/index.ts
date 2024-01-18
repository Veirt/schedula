import { Hono } from "hono"
import { jwt } from "hono/jwt"
import { setCookie, getCookie } from "hono/cookie"
import { cors } from "hono/cors"
import jsonwebtoken from "jsonwebtoken"
import { Account } from "./models/Account"
import { Schedule } from "./models/Schedule"

const app = new Hono()
app.use("/api/*", cors())

Schedule.init()
Account.init()

app.get("/api/schedule", (c) => {
    return c.json({ data: Schedule.getGroupedByDay() })
})

app.post("/api/schedule", async (c) => {
    const body = await c.req.parseBody()

    if (typeof body.day !== "string" || isNaN(parseInt(body.day))) {
        return c.json({ error: "Invalid day" }, 400)
    }

    if (typeof body.course !== "string") {
        return c.json({ error: "Expected course to be a string" }, 400)
    }

    if (typeof body.classroom !== "string") {
        return c.json({ error: "Expected classroom to be a string" }, 400)
    }

    if (typeof body.lecturer !== "string") {
        return c.json({ error: "Expected lecturer(s) to be a string" }, 400)
    }

    if (typeof body.startTime !== "string") {
        return c.json({ error: "Expected start time to be a string" }, 400)
    }

    if (typeof body.endTime !== "string") {
        return c.json({ error: "Expected start time to be a string" }, 400)
    }

    const newSchedule = new Schedule({
        course: body.course,
        classroom: body.classroom,
        lecturer: body.lecturer,
        startTime: body.startTime,
        endTime: body.endTime,
        day: parseInt(body.day),
    })

    newSchedule.insert()

    return c.json(null, 201)
})

app.get("/api/schedule/:id", (c) => {
    const id = parseInt(c.req.param("id"))

    if (isNaN(id)) {
        return c.json({ error: "Invalid id given" }, 400)
    }

    const entry = Schedule.getFirst({ id })
    if (!entry) {
        return c.json({ error: "Schedule Entry is not found", data: { entry: {} } }, 404)
    }

    return c.json({ data: { entry } })
})

app.patch("/api/schedule/:id", async (c) => {
    const id = parseInt(c.req.param("id"))

    if (isNaN(id)) {
        return c.json({ error: "Invalid id given" }, 400)
    }

    const body = await c.req.parseBody()
    const entry = Schedule.getFirst({ id })
    if (!entry) {
        return c.json({ error: "Schedule Entry is not found", data: { entry: {} } }, 404)
    }

    entry.day = !isNaN(parseInt(body.day as string)) ? parseInt(body.day as string) : entry.day
    entry.startTime = (body.startTime as string) || entry.startTime
    entry.endTime = (body.endTime as string) || entry.endTime
    entry.classroom = (body.classroom as string) || entry.classroom
    entry.lecturer = (body.lecturer as string) || entry.lecturer

    const schedule = new Schedule({ ...entry })
    schedule.update()

    return c.json({}, 204)
})

app.delete("/api/schedule/:id", async (c) => {
    const id = parseInt(c.req.param("id"))

    if (isNaN(id)) {
        return c.json({ error: "Invalid id given" }, 400)
    }

    const entry = Schedule.getFirst({ id })
    if (!entry) {
        return c.json({ error: "Schedule Entry is not found", data: { entry: {} } }, 404)
    }

    const schedule = new Schedule({ ...entry })
    schedule.delete()

    return c.json({}, 204)
})

app.get("/api/schedule/day/today", (c) => {
    const day = new Date().getDay()

    return c.json({
        data: {
            schedule: Schedule.get({ day }),
        },
    })
})

app.get("/api/schedule/day/:day", (c) => {
    const day = parseInt(c.req.param("day"))
    if (day < 0 || day > 6 || isNaN(day)) {
        return c.json({ error: "Invalid day" }, 400)
    }

    return c.json({
        data: {
            schedule: Schedule.get({ day }),
        },
    })
})

// auth
app.get("/oauth/discord/callback", async (c) => {
    const code = c.req.query("code")

    if (!code) {
        return c.json({ error: "invlaid request" }, 400)
    }

    const body = new URLSearchParams({
        client_id: Bun.env.DISCORD_OAUTH_CLIENT_ID!,
        client_secret: Bun.env.DISCORD_OAUTH_CLIENT_SECRET!,
        redirect_uri: Bun.env.DISCORD_OAUTH_REDIRECT_URI!,
        grant_type: "authorization_code",
        code,
    })

    const res = await fetch("https://discord.com/api/oauth2/token", { method: "POST", body })
    const authData = (await res.json()) as { access_token: string; refresh_token: string }

    if (!authData.access_token || !authData.refresh_token) {
        return c.json({ error: "invalid code" }, 400)
    }

    const userRes = await fetch("https://discord.com/api/users/@me", {
        headers: {
            authorization: `Bearer ${authData.access_token}`,
        },
    })

    const userData = await userRes.json()

    const userServerRes = await fetch("https://discord.com/api/users/@me/guilds", {
        headers: {
            authorization: `Bearer ${authData.access_token}`,
        },
    })
    const userServerData = await userServerRes.json()

    const isUserInServer = userServerData.find((s: { id: string }) => s.id === Bun.env.DISCORD_SERVER_ID)
    if (!isUserInServer) {
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

    const token = jsonwebtoken.sign({ id: account.id, name: account.name }, Bun.env.JWT_SECRET!)

    setCookie(c, "jwt", token)
    return c.redirect(Bun.env.CLIENT_URL!)
})

app.get("/oauth/discord", (c) => {
    return c.redirect(
        `https://discordapp.com/api/oauth2/authorize?client_id=${Bun.env.DISCORD_OAUTH_CLIENT_ID}&redirect_uri=${Bun.env.DISCORD_OAUTH_REDIRECT_URI}&response_type=code&scope=guilds+identify`,
    )
})

app.use(
    "/api/*",
    jwt({
        secret: Bun.env.JWT_SECRET!,
        cookie: "jwt",
    }),
)

app.get("/api/accounts/@me", async (c) => {
    const payload = c.get("jwtPayload")

    const account = Account.getFirst({ id: payload.id })
    if (!account) {
        return c.json({ error: "Unauthorized" }, 401)
    }

    return c.json({ data: { account } })
})

app.post("/api/auth/logout", (c) => {
    setCookie(c, "jwt", "", { maxAge: 0 })

    return c.json({}, 204)
})

export default app
