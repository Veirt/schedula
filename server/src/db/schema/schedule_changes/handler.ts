import { eq, sql } from "drizzle-orm"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import db from "../.."
import { scheduleChanges } from "./schema"
import { z } from "zod"
import { compareAsc } from "date-fns"

export type ScheduleChange = typeof scheduleChanges.$inferSelect
type NewScheduleChange = typeof scheduleChanges.$inferInsert

export const selectScheduleChangeSchema = createSelectSchema(scheduleChanges)
const timeRegex = new RegExp(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)

// TODO: date regex
const base = createInsertSchema(scheduleChanges, {
    startTime: (schema) => schema.startTime.regex(timeRegex, { message: "Start time is not valid" }),
    endTime: (schema) => schema.endTime.regex(timeRegex, { message: "End time is not valid" }),
    transitionedDate: (schema) => schema.transitionedDate,
})

export const insertScheduleChangeSchema = base.refine((data) => {
    console.log(data.startTime)
    const transitionedDate = new Date(`${data.transitionedDate} ${data.startTime}`)
    const currentDate = new Date()

    return compareAsc(currentDate, transitionedDate) !== 1
}, "Transitioned date cannot be in the past")

export const updateScheduleChangeSchema = base.omit({ id: true }).refine((data) => {
    const transitionedDate = new Date(`${data.transitionedDate} ${data.startTime}`)
    const currentDate = new Date()

    return compareAsc(currentDate, transitionedDate) !== 1
}, "Transitioned date cannot be in the past")

export class ScheduleChangesHandler {
    static async getAll(scheduleId?: number) {
        if (scheduleId) {
            const result = db.query.scheduleChanges
                .findMany({
                    where: (schedule_changes, { eq }) => eq(schedule_changes.scheduleId, sql.placeholder("scheduleId")),
                })
                .prepare()
            return result.execute({ scheduleId })
        }

        return await db.query.scheduleChanges.findMany()
    }

    static async getByid(id: number) {
        return await db.query.scheduleChanges.findFirst({ where: eq(scheduleChanges.id, id) })
    }

    static async insert(scheduleChange: NewScheduleChange) {
        return await db.insert(scheduleChanges).values(scheduleChange)
    }

    static async update(id: number, scheduleChange: z.infer<typeof updateScheduleChangeSchema>) {
        await db.update(scheduleChanges).set(scheduleChange).where(eq(scheduleChanges.id, id))
    }

    static async deleteById(id: number) {
        await db.delete(scheduleChanges).where(eq(scheduleChanges.id, id))
    }
}
