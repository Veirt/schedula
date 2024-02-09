import { Day } from "date-fns"
import { Context, Env } from "hono"
import z from "zod"
import { ScheduleHandler, insertScheduleSchema, updateScheduleSchema } from "../db/schema/schedules/handler"
import {
    ScheduleChangesHandler,
    insertScheduleChangeSchema,
    updateScheduleChangeSchema,
} from "../db/schema/schedule_changes/handler"

export const getDefaultSchedules = async (c: Context) => {
    const schedule = await ScheduleHandler.getAll()

    return c.json({ data: schedule })
}

export const getSchedule = async (c: Context) => {
    const nextNWeeks = c.req.query("nextNWeeks")
    let schedule
    if (nextNWeeks) {
        schedule = await ScheduleHandler.get(parseInt(nextNWeeks))
    } else {
        schedule = await ScheduleHandler.get()
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

    return c.json({ data: grouped })
}

export const createSchedule = async (c: Context<Env, "/", { out: { json: z.infer<typeof insertScheduleSchema> } }>) => {
    const data = c.req.valid("json")
    await ScheduleHandler.insert(data)

    return c.json({ success: true }, 201)
}

export const getScheduleById = async (c: Context) => {
    const id = parseInt(c.req.param("id"))

    const schedule = await ScheduleHandler.getById(id)
    if (!schedule) {
        return c.json({ success: false, error: "Schedule Entry is not found" }, 404)
    }

    return c.json({ success: true, data: schedule })
}

export const updateScheduleById = async (
    c: Context<Env, "/:id", { out: { json: z.infer<typeof updateScheduleSchema> } }>,
) => {
    const id = parseInt(c.req.param("id"))

    const body = c.req.valid("json")
    const schedule = await ScheduleHandler.getById(id)
    if (!schedule) {
        return c.json({ success: false, error: "Schedule Entry is not found" }, 404)
    }

    Object.assign(schedule, body)
    await ScheduleHandler.update(id, schedule)

    return c.json({ success: true }, 200)
}

export const deleteScheduleById = async (c: Context) => {
    const id = parseInt(c.req.param("id"))

    const schedule = await ScheduleHandler.getById(id)
    if (!schedule) {
        return c.json({ success: false, error: "Schedule Entry is not found" }, 404)
    }
    await ScheduleHandler.deleteById(id)

    return c.json({ success: true }, 200)
}

export const getSchedulesByDay = async (c: Context) => {
    const day = parseInt(c.req.param("day")) as Day

    return c.json({
        success: true,
        data: await ScheduleHandler.getByDay(day),
    })
}

export const getScheduleChanges = async (c: Context) => {
    const scheduleId = c.req.query("schedule_id")
    const scheduleChanges = await ScheduleChangesHandler.getAll(scheduleId ? parseInt(scheduleId) : undefined)

    return c.json({ success: true, data: scheduleChanges })
}

export const getScheduleChangeById = async (c: Context) => {
    const scheduleChangeId = parseInt(c.req.param("id"))

    const scheduleChange = await ScheduleChangesHandler.getByid(scheduleChangeId)
    if (!scheduleChange) {
        return c.json({ success: false, data: {} }, 404)
    }

    return c.json({ success: true, data: scheduleChange })
}

export const createScheduleChange = async (
    c: Context<Env, "/changes", { out: { json: z.infer<typeof insertScheduleChangeSchema> } }>,
) => {
    const data = c.req.valid("json")

    await ScheduleChangesHandler.insert(data)

    return c.json({ success: true }, 201)
}

export const updateScheduleChangeById = async (
    c: Context<Env, "/changes/:id", { out: { json: z.infer<typeof updateScheduleChangeSchema> } }>,
) => {
    const id = parseInt(c.req.param("id"))
    const body = c.req.valid("json")

    const scheduleChange = await ScheduleChangesHandler.getByid(id)
    if (!scheduleChange) {
        return c.json({ sucess: false }, 404)
    }

    Object.assign(scheduleChange, body)
    await ScheduleChangesHandler.update(id, scheduleChange)

    return c.json({ success: true }, 200)
}

export const deleteScheduleChangeById = async (c: Context) => {
    const id = parseInt(c.req.param("id"))
    await ScheduleChangesHandler.deleteById(id)

    return c.json({ success: true }, 200)
}
