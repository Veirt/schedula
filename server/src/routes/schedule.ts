import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { jwt } from "hono/jwt"
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
import { z } from "zod"

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

scheduleRouter.get("/", getScheduleThisWeek)
scheduleRouter.post("/", createScheduleEntry)

scheduleRouter.get("/changes", getScheduleChange)
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

scheduleRouter.get("/:id", getScheduleEntryById)
scheduleRouter.patch("/:id", updateScheduleEntryById)
scheduleRouter.delete("/:id", deleteScheduleEntryById)

scheduleRouter.get("/day/:day", getScheduleEntryByDay)

export default scheduleRouter
