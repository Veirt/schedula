import { Hono } from "hono"
import { cors } from "hono/cors"
import fs from "fs"

const app = new Hono()
app.use("/api/*", cors())

type ScheduleEntry = {
    dayIndex: number
    entryIndex: number
    start: string
    end: string
    classroom: string
    course: string
    lecturer: string
}

// schedule[day][lesson]
type Schedule = ScheduleEntry[][]

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

function getSchedule() {
    let schedule: Schedule = JSON.parse(fs.readFileSync("./schedule.json", { encoding: "utf8" }))

    schedule = schedule.map((todaySchedule, dayIdx) => {
        todaySchedule.map((entry, entryIdx) => {
            entry.dayIndex = dayIdx
            entry.entryIndex = entryIdx

            return entry
        })

        return todaySchedule
    })

    return schedule
}

app.get("/api/schedule", (c) => {
    return c.json({ data: getSchedule() })
})

app.get("/api/schedule/today", (c) => {
    const day = new Date().getDay()

    return c.json({
        data: {
            day: dayNames[day],
            schedule: getSchedule()[day],
        },
    })
})

app.get("/api/schedule/:day/entry/:entry", (c) => {
    const day = parseInt(c.req.param("day"))
    const entry = parseInt(c.req.param("entry"))

    return c.json({
        data: {
            schedule: getSchedule()[day][entry],
        },
    })
})

app.get("/api/schedule/:day", (c) => {
    const day = parseInt(c.req.param("day"))
    if (day < 0 || day > 6) {
        return c.json({ error: "Invalid day" }, 400)
    }

    return c.json({
        data: {
            day: dayNames[day],
            schedule: getSchedule()[day],
        },
    })
})

export default app
