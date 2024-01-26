import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { jwt } from "hono/jwt"
import { z } from "zod"
import { JWT_SECRET } from "../config/env"
import {
    createScheduleChange,
    createScheduleEntry,
    deleteScheduleChangeById,
    deleteScheduleEntryById,
    getScheduleChange,
    getScheduleChangeById,
    getScheduleEntryByDay,
    getScheduleEntryById,
    getScheduleThisWeek,
    updateScheduleChangeById,
    updateScheduleEntryById,
} from "../controllers/schedule"
import { scheduleChangeSchema } from "../models/ScheduleChanges"
import { scheduleSchema } from "../models/Schedule"

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
    getScheduleChange,
)
scheduleRouter.get("/changes/:id", getScheduleChangeById)
scheduleRouter.patch(
    "/changes/:id",
    zValidator("param", z.object({ id: z.string().pipe(z.coerce.number()) })),
    zValidator("json", scheduleChangeSchema),
    updateScheduleChangeById,
)
scheduleRouter.delete(
    "/changes/:id",
    zValidator("param", z.object({ id: z.string().pipe(z.coerce.number()) })),
    deleteScheduleChangeById,
)
scheduleRouter.post("/changes", zValidator("json", scheduleChangeSchema), createScheduleChange)

// Get schedule this week
scheduleRouter.get("/", getScheduleThisWeek)

// Create schedule entry
scheduleRouter.post("/", zValidator("json", scheduleSchema), createScheduleEntry)

// Get schedule entry by id
scheduleRouter.get(
    "/:id",
    zValidator("param", z.object({ id: z.string().pipe(z.coerce.number()) })),
    getScheduleEntryById,
)

// Update schedule entry by id
scheduleRouter.patch(
    "/:id",
    zValidator("param", z.object({ id: z.string().pipe(z.coerce.number()) })),
    zValidator("json", scheduleSchema),
    updateScheduleEntryById,
)

// Delete Schedule entry by id
scheduleRouter.delete(
    "/:id",
    zValidator("param", z.object({ id: z.string().pipe(z.coerce.number()) })),
    deleteScheduleEntryById,
)

// Get Schedule entry by day index
scheduleRouter.get(
    "/day/:day",
    zValidator("param", z.object({ day: z.string().pipe(z.coerce.number().min(0).max(6)) })),
    getScheduleEntryByDay,
)

export default scheduleRouter
