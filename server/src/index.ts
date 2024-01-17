import { Hono } from "hono"
import { cors } from "hono/cors"
import { Schedule, ScheduleType } from "./models/Schedule"

const app = new Hono()
app.use("/api/*", cors())

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

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

// app.get("/api/schedule/today", (c) => {
//     const day = new Date().getDay()
//
//     return c.json({
//         data: {
//             day: dayNames[day],
//             schedule: getSchedule()[day],
//         },
//     })
// })
//
// app.get("/api/schedule/:day/entry/:entry", (c) => {
//     const day = parseInt(c.req.param("day"))
//     const entry = parseInt(c.req.param("entry"))
//
//     return c.json({
//         data: {
//             schedule: getSchedule()[day][entry],
//         },
//     })
// })
//
// app.get("/api/schedule/:day", (c) => {
//     const day = parseInt(c.req.param("day"))
//     if (day < 0 || day > 6) {
//         return c.json({ error: "Invalid day" }, 400)
//     }
//
//     return c.json({
//         data: {
//             day: dayNames[day],
//             schedule: getSchedule()[day],
//         },
//     })
// })

export default app
