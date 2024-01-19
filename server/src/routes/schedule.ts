import { Hono } from "hono"
import { jwt } from "hono/jwt"
import { JWT_SECRET } from "../config/env"
import {
    createScheduleEntry,
    deleteScheduleEntryById,
    getScheduleEntryByDay,
    getScheduleEntryById,
    getScheduleGroupedByDay,
    updateScheduleEntryById,
} from "../controllers/schedule"

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

scheduleRouter.get("/", getScheduleGroupedByDay)
scheduleRouter.post("/", createScheduleEntry)

scheduleRouter.get("/:id", getScheduleEntryById)
scheduleRouter.patch("/:id", updateScheduleEntryById)
scheduleRouter.delete("/:id", deleteScheduleEntryById)

scheduleRouter.get("/day/:day", getScheduleEntryByDay)

export default scheduleRouter
