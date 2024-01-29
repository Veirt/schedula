import { relations } from "drizzle-orm"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { scheduleChanges } from "../schedule_changes/schema"

export const schedules = sqliteTable("schedules", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    course: text("course").notNull(),
    classroom: text("classroom").notNull(),
    lecturer: text("lecturer").notNull(),
    startTime: text("start_time").notNull(),
    endTime: text("end_time").notNull(),
    day: integer("day").notNull(),
})

export const schedulesRelations = relations(schedules, ({ many }) => ({
    changes: many(scheduleChanges),
}))
