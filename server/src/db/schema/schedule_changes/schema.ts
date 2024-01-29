import { relations } from "drizzle-orm"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { schedules } from "../schedules/schema"

export const scheduleChanges = sqliteTable("schedule_changes", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    scheduleId: integer("schedule_id")
        .references(() => schedules.id, { onDelete: "cascade" })
        .notNull(),
    classroom: text("classroom"),
    startTime: text("start_time"),
    endTime: text("end_time"),
    type: text("type"),
    scheduledDate: text("scheduled_date"),
    transitionedDate: text("transitioned_date"),
})

export const scheduleChangesRelations = relations(scheduleChanges, ({ one }) => ({
    schedule: one(schedules, {
        fields: [scheduleChanges.scheduleId],
        references: [schedules.id],
    }),
}))
