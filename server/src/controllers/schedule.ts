import { Context, Env } from "hono"
import z from "zod"
import { Schedule, scheduleSchema } from "../models/Schedule"
import { ScheduleChange, scheduleChangeSchema } from "../models/ScheduleChanges"

export const getScheduleThisWeek = (c: Context) => {
    return c.json({ data: Schedule.getThisWeek() })
}

export const createScheduleEntry = async (c: Context<Env, "/", { out: { json: z.infer<typeof scheduleSchema> } }>) => {
    const data = c.req.valid("json")

    const newSchedule = new Schedule(data)
    newSchedule.insert()

    return c.json(null, 201)
}

export const getScheduleChange = (c: Context) => {
    const scheduleId = c.req.query("schedule_id")
    if (scheduleId) {
        const scheduleChanges = ScheduleChange.getAll(parseInt(scheduleId))
        return c.json({ data: scheduleChanges })
    }
    const scheduleChanges = ScheduleChange.getAll()

    return c.json({ data: scheduleChanges })
}

export const getScheduleChangeById = (c: Context) => {
    const scheduleChangeId = parseInt(c.req.param("id"))

    const scheduleChange = ScheduleChange.getById(scheduleChangeId)

    return c.json({ data: scheduleChange })
}

export const createScheduleChange = (
    c: Context<Env, "/changes", { out: { json: z.infer<typeof scheduleChangeSchema> } }>,
) => {
    const data = c.req.valid("json")

    const newScheduleChange = new ScheduleChange(data)
    newScheduleChange.insert()

    return c.json({}, 201)
}

export const updateScheduleChangeById = (
    c: Context<Env, "/changes/:id", { out: { json: z.infer<typeof scheduleChangeSchema> } }>,
) => {
    const id = c.req.param("id")
    const data = c.req.valid("json")

    const scheduleChange = new ScheduleChange({ sch_change_id: parseInt(id), ...data })
    scheduleChange.update()

    return c.json({}, 204)
}

export const deleteScheduleChangeById = (c: Context) => {
    const id = c.req.param("id")

    ScheduleChange.deleteById(parseInt(id))
    return c.json({}, 204)
}

export const getScheduleEntryById = (c: Context) => {
    const id = parseInt(c.req.param("id"))

    const entry = Schedule.getFirst({ id })
    if (!entry) {
        return c.json({ error: "Schedule Entry is not found", data: { entry: {} } }, 404)
    }

    return c.json({ data: { entry } })
}

export const updateScheduleEntryById = async (
    c: Context<Env, "/:id", { out: { json: z.infer<typeof scheduleSchema> } }>,
) => {
    const id = parseInt(c.req.param("id"))

    const body = c.req.valid("json")
    const entry = Schedule.getFirst({ id })
    if (!entry) {
        return c.json({ error: "Schedule Entry is not found", data: { entry: {} } }, 404)
    }

    entry.day = body.day !== undefined ? body.day : entry.day
    entry.start_time = body.start_time || entry.start_time
    entry.end_time = body.end_time || entry.end_time
    entry.classroom = body.classroom || entry.classroom
    entry.lecturer = body.lecturer || entry.lecturer

    const schedule = new Schedule(entry)
    schedule.update()

    return c.json({}, 204)
}

export const deleteScheduleEntryById = (c: Context) => {
    const id = parseInt(c.req.param("id"))

    const entry = Schedule.getFirst({ id })
    if (!entry) {
        return c.json({ error: "Schedule Entry is not found", data: { entry: {} } }, 404)
    }

    const schedule = new Schedule({ ...entry })
    schedule.delete()

    return c.json({}, 204)
}

export const getScheduleEntryByDay = (c: Context) => {
    const day = parseInt(c.req.param("day"))

    return c.json({
        data: {
            schedule: Schedule.get({ day }),
        },
    })
}
