import { Day, add, eachDayOfInterval, format, nextMonday, startOfISOWeek } from "date-fns"
import { eq, sql } from "drizzle-orm"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"
import db from "../.."
import { schedules } from "./schema"

export type Schedule = typeof schedules.$inferSelect
type NewSchedule = typeof schedules.$inferInsert

const timeRegex = new RegExp(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
export const insertScheduleSchema = createInsertSchema(schedules, {
    startTime: (schema) => schema.startTime.regex(timeRegex, { message: "Start time is not valid" }),
    endTime: (schema) => schema.endTime.regex(timeRegex, { message: "End time is not valid" }),
    day: (schema) => schema.day.min(0).max(6),
})

export const updateScheduleSchema = insertScheduleSchema.omit({ id: true })

export class ScheduleHandler {
    static async getAll() {
        return await db.query.schedules.findMany()
    }

    static async get(nextNWeeks?: number) {
        let startOfWeek = startOfISOWeek(new Date())
        if (nextNWeeks !== undefined) {
            startOfWeek = add(startOfWeek, { weeks: nextNWeeks })
        }

        const daysOfWeek = eachDayOfInterval({
            start: startOfWeek,
            end: add(startOfWeek, { days: 6 }),
        })
        const daysOfWeekFormatted: string[] = daysOfWeek.map((day) => format(day, "y-MM-dd"))

        const sunday = daysOfWeekFormatted.pop()!
        const monday = daysOfWeekFormatted[0]
        daysOfWeekFormatted.unshift(sunday)

        const statement = sql`
        -- normal ones
        SELECT
          s.id,
          s.course,
          s.classroom,
          s.lecturer,
          s.start_time AS startTime,
          s.end_time AS endTime,
          s.day,
          NULL AS scheduleChangeId,
          NULL AS type,
          NULL AS scheduledDate,
          NULL AS transitionedDate,
          NULL AS transitionedDay
        FROM schedules s
        WHERE s.id NOT IN (
          SELECT schedule_id FROM schedule_changes WHERE scheduled_date BETWEEN ${monday} AND ${sunday}
        )
        UNION
        -- transition-after and cancellation
        SELECT 
          s.id,
          s.course,
          COALESCE(sc.classroom, s.classroom) AS classroom,
          s.lecturer,
          COALESCE(sc.start_time, s.start_time) AS startTime,
          COALESCE(sc.end_time, s.end_time) AS endTime,
          COALESCE(strftime('%w', sc.transitioned_date), s.day) AS day, -- if transitioned_date exists, then get the day from that
          sc.id AS scheduleChangeId,
          CASE WHEN sc.type = 'transition' THEN 'transition-after'
             ELSE sc.type 
          END AS type,
          sc.scheduled_date as scheduledDate,
          sc.transitioned_date as transitionedDate,
          CAST(strftime('%w', sc.transitioned_date) AS number) AS transitionedDay
        FROM schedules s
        JOIN schedule_changes sc ON s.id = sc.schedule_id AND
        CASE
           WHEN type = 'transition' THEN transitioned_date BETWEEN ${monday} AND ${sunday}
           WHEN type = 'cancellation' THEN scheduled_date BETWEEN ${monday} AND ${sunday}
        END
        UNION
        -- transition-before
        SELECT
            s.*,
          sc.id AS scheduleChangeId,
            'transition-before' AS type,
          sc.scheduled_date AS scheduledDate,
          sc.transitioned_date AS transitionedDate,
          NULL  AS transitionedDay
        FROM schedules s
        JOIN schedule_changes sc ON s.id = sc.schedule_id AND sc.type = 'transition' AND scheduled_date BETWEEN ${monday} AND ${sunday}
        ORDER BY startTime ASC
        `

        // Type of Schedule and ScheduleChange
        type QueryResult = Schedule & {
            transitionedDay: Day | null
            scheduleChangeId: number | null
            type: string | null
            scheduledDate: string | null
            transitionedDate: string | null
            date?: string
        }

        let res: QueryResult[] = db.all(statement)
        res.map((sch) => {
            // put date to the schedule entry
            const day = sch.transitionedDay !== null ? sch.transitionedDay : sch.day
            sch.date = daysOfWeekFormatted[day]

            return sch
        })

        return res
    }

    static async getById(id: number) {
        // return await db.query.schedules.findFirst({ where: eq(schedules.id, id) })

        const scheduleRes = await db.select().from(schedules).where(eq(schedules.id, id)).limit(1)
        if (scheduleRes.length === 0) {
            return undefined
        }

        const schedule = scheduleRes[0]
        return schedule
    }

    static async getByDay(dayIndex: Day) {
        // return await db.query.schedules.findFirst({ where: eq(schedules.day, dayIndex) })

        const scheduleRes = await db.select().from(schedules).where(eq(schedules.day, dayIndex)).limit(1)
        if (scheduleRes.length === 0) {
            return undefined
        }

        const schedule = scheduleRes[0]
        return schedule
    }

    static async getGrouped(nextNWeeks?: string) {
        let schedule
        if (nextNWeeks) {
            schedule = await this.get(parseInt(nextNWeeks))
        } else {
            schedule = await this.get()
        }

        // @ts-ignore
        let grouped = Object.groupBy(schedule, ({ day, transitionedDay }: { day: Day; transitionedDay: Day }) =>
            transitionedDay !== null ? transitionedDay : day,
        )
        grouped = {
            0: [],
            1: [],
            2: [],
            3: [],
            4: [],
            5: [],
            6: [],
            ...grouped,
        }

        return grouped
    }

    static async insert(sch: NewSchedule) {
        await db.insert(schedules).values(sch)
    }

    static async update(id: number, sch: z.infer<typeof updateScheduleSchema>) {
        await db.update(schedules).set(sch).where(eq(schedules.id, id))
    }

    static async deleteById(id: number) {
        await db.delete(schedules).where(eq(schedules.id, id))
    }
}
