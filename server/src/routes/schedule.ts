import { Hono } from "hono"
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

scheduleRouter.get("/", getScheduleGroupedByDay)
scheduleRouter.post("/", createScheduleEntry)

scheduleRouter.get("/:id", getScheduleEntryById)
scheduleRouter.patch("/:id", updateScheduleEntryById)
scheduleRouter.delete("/:id", deleteScheduleEntryById)

scheduleRouter.get("/day/:day", getScheduleEntryByDay)

export default scheduleRouter
