import { Context, Env } from "hono"
import z from "zod"
import { Schedule } from "../models/Schedule"
import { ScheduleChange, scheduleChangeSchema } from "../models/ScheduleChanges"

export const getScheduleThisWeek = (c: Context) => {
    return c.json({ data: Schedule.getThisWeek() })
}

export const createScheduleEntry = async (c: Context) => {
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

    if (typeof body.start_time !== "string") {
        return c.json({ error: "Expected start time to be a string" }, 400)
    }

    if (typeof body.end_time !== "string") {
        return c.json({ error: "Expected start time to be a string" }, 400)
    }

    const newSchedule = new Schedule({
        course: body.course,
        classroom: body.classroom,
        lecturer: body.lecturer,
        start_time: body.start_time,
        end_time: body.end_time,
        day: parseInt(body.day),
    })

    newSchedule.insert()

    return c.json(null, 201)
}

export const getScheduleChange = (c: Context) => {
    // TODO: handle validation better than only parseInt
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

    if (isNaN(id)) {
        return c.json({ error: "Invalid id given" }, 400)
    }

    const entry = Schedule.getFirst({ id })
    if (!entry) {
        return c.json({ error: "Schedule Entry is not found", data: { entry: {} } }, 404)
    }

    return c.json({ data: { entry } })
}

export const updateScheduleEntryById = async (c: Context) => {
    const id = parseInt(c.req.param("id"))

    if (isNaN(id)) {
        return c.json({ error: "Invalid id given" }, 400)
    }

    const body = await c.req.parseBody()
    const entry = Schedule.getFirst({ id })
    if (!entry) {
        return c.json({ error: "Schedule Entry is not found", data: { entry: {} } }, 404)
    }

    entry.day = !isNaN(parseInt(body.day as string)) ? parseInt(body.day as string) : entry.day
    entry.start_time = (body.start_time as string) || entry.start_time
    entry.end_time = (body.end_time as string) || entry.end_time
    entry.classroom = (body.classroom as string) || entry.classroom
    entry.lecturer = (body.lecturer as string) || entry.lecturer

    const schedule = new Schedule({ ...entry })
    schedule.update()

    return c.json({}, 204)
}

export const deleteScheduleEntryById = (c: Context) => {
    const id = parseInt(c.req.param("id"))

    if (isNaN(id)) {
        return c.json({ error: "Invalid id given" }, 400)
    }

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
    if (day < 0 || day > 6 || isNaN(day)) {
        return c.json({ error: "Invalid day" }, 400)
    }

    return c.json({
        data: {
            schedule: Schedule.get({ day }),
        },
    })
}
