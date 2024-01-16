import { Hono } from "hono"
import { cors } from "hono/cors"
import { Schedule } from "./models/Schedule"

const app = new Hono()
app.use("/api/*", cors())

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

Schedule.init()

app.get("/api/schedule", (c) => {
    console.log()

    return c.json({ data: Schedule.getGroupedByDay() })
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
