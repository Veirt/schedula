import { subMinutes } from "date-fns"
import nodeSchedule from "node-schedule"
import { Schedule, ScheduleHandler } from "../db/schema/schedules/handler"
import { DISCORD_WEBHOOK_URL } from "../config/env"

let cache: ScheduleThisWeek | undefined

type ScheduleThisWeek = Schedule & {
    transitionedDay: number | null
    scheduleChangeId: number | null
    type: string | null
    scheduledDate: string | null
    transitionedDate: string | null
    date: string
}

type ScheduleGrouped = {
    [key: string]: ScheduleThisWeek[]
}

async function getSchedule() {
    return await ScheduleHandler.getGrouped()
}

async function setupSchedule(data: ScheduleGrouped) {
    for (const [day, schedule] of Object.entries(data)) {
        for (const sch of schedule) {
            // subtract 30 minutes
            const date = new Date(`${sch.date} ${sch.startTime}`)
            const subtracted = subMinutes(date, 30)

            const hours = subtracted.getHours()
            const minutes = subtracted.getMinutes()

            nodeSchedule.scheduleJob(`${minutes} ${hours} * * ${day}`, async () => {
                const message = `${sch.course} will start in 30 minutes. (${sch.classroom})`
                console.log(`[Schedule] ${message}`)

                const payload = {
                    content: `Reminder: ${message}`,
                }
                await fetch(DISCORD_WEBHOOK_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                })
            })
        }
    }
}

// Regularly check for changes
// There must be a better way to do this, but I'm not sure how.
setInterval(() => {
    getSchedule().then(async (data) => {
        if (JSON.stringify(cache) !== JSON.stringify(data)) {
            await nodeSchedule.gracefulShutdown()
            cache = data
            await setupSchedule(data)
        }
    })
}, 5000)
