import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"

import { accounts } from "./schema/accounts/schema"
import { scheduleChanges, scheduleChangesRelations } from "./schema/schedule_changes/schema"
import { schedules, schedulesRelations } from "./schema/schedules/schema"

const sqlite = new Database(process.env.DATABASE_PATH || "./db.sqlite")
const db = drizzle(sqlite, {
    schema: { accounts, schedules, scheduleChanges, schedulesRelations, scheduleChangesRelations },
})

export default db
