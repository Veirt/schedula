import { Hono } from "hono"
import { cors } from "hono/cors"
import { Schedule } from "./models/Schedule"

const app = new Hono()
app.use("/api/*", cors())

Schedule.init()

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

    entry.day = parseInt(body.day as string) || entry.day
    entry.startTime = (body.startTime as string) || entry.startTime
    entry.endTime = (body.endTime as string) || entry.endTime
    entry.classroom = (body.classroom as string) || entry.classroom
    entry.lecturer = (body.lecturer as string) || entry.lecturer

    const schedule = new Schedule({ ...entry })
    schedule.update()

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

export default app
