import { Hono } from "hono"
import { jwt } from "hono/jwt"
import { JWT_SECRET } from "../config/env"
import {
    createScheduleChanges,
    createScheduleEntry,
    deleteScheduleEntryById,
    getScheduleEntryByDay,
    getScheduleEntryById,
    getScheduleThisWeek,
    updateScheduleEntryById,
} from "../controllers/schedule"
import { zValidator } from "@hono/zod-validator"
import { scheduleChangeSchema } from "../models/ScheduleChanges"

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

scheduleRouter.post("/changes", zValidator("json", scheduleChangeSchema), createScheduleChanges)

scheduleRouter.get("/:id", getScheduleEntryById)
scheduleRouter.patch("/:id", updateScheduleEntryById)
scheduleRouter.delete("/:id", deleteScheduleEntryById)

scheduleRouter.get("/day/:day", getScheduleEntryByDay)

export default scheduleRouter
