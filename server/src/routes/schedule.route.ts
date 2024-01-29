import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { jwt } from "hono/jwt"
import { z } from "zod"
import { JWT_SECRET } from "../config/env"
import {
    createSchedule,
    createScheduleChange,
    deleteScheduleById,
    deleteScheduleChangeById,
    getDefaultSchedules,
    getScheduleById,
    getScheduleChangeById,
    getScheduleChanges,
    getScheduleThisWeek,
    getSchedulesByDay,
    updateScheduleById,
    updateScheduleChangeById,
} from "../controllers/schedule.controller"
import { insertScheduleChangeSchema, updateScheduleChangeSchema } from "../db/schema/schedule_changes/handler"
import { insertScheduleSchema, updateScheduleSchema } from "../db/schema/schedules/handler"

// /api/schedule
const scheduleRouter = new Hono()
scheduleRouter.use("/*", (c, next) => {
    const jwtMiddleware = jwt({
        secret: JWT_SECRET,
        cookie: "jwt",
    })

    // only allow get requests without jwt
    if (c.req.method === "GET") return next()

    return jwtMiddleware(c, next)
})

scheduleRouter.get(
    "/changes",
    zValidator("query", z.object({ schedule_id: z.string().pipe(z.coerce.number()).optional() })),
    getScheduleChanges,
)
scheduleRouter.get("/changes/:id", getScheduleChangeById)
scheduleRouter.patch(
    "/changes/:id",
    zValidator("param", z.object({ id: z.string().pipe(z.coerce.number()) })),
    zValidator("json", updateScheduleChangeSchema),
    updateScheduleChangeById,
)
scheduleRouter.delete(
    "/changes/:id",
    zValidator("param", z.object({ id: z.string().pipe(z.coerce.number()) })),
    deleteScheduleChangeById,
)
scheduleRouter.post("/changes", zValidator("json", insertScheduleChangeSchema), createScheduleChange)

// Get default schedule
scheduleRouter.get("/default", getDefaultSchedules)

// Get schedule this week
scheduleRouter.get("/", getScheduleThisWeek)

// Create schedule entry
scheduleRouter.post("/", zValidator("json", insertScheduleSchema), createSchedule)

// Get schedule entry by id
scheduleRouter.get("/:id", zValidator("param", z.object({ id: z.string().pipe(z.coerce.number()) })), getScheduleById)

// Update schedule entry by id
scheduleRouter.patch(
    "/:id",
    zValidator("param", z.object({ id: z.string().pipe(z.coerce.number()) })),
    zValidator("json", updateScheduleSchema),
    updateScheduleById,
)

// Delete Schedule entry by id
scheduleRouter.delete(
    "/:id",
    zValidator("param", z.object({ id: z.string().pipe(z.coerce.number()) })),
    deleteScheduleById,
)

// Get Schedule entry by day index
scheduleRouter.get(
    "/day/:day",
    zValidator("param", z.object({ day: z.string().pipe(z.coerce.number().min(0).max(6)) })),
    getSchedulesByDay,
)

export default scheduleRouter
