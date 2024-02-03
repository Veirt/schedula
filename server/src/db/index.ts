import { Database } from "bun:sqlite"
import { drizzle } from "drizzle-orm/bun-sqlite"

import { accounts } from "./schema/accounts/schema"
import { scheduleChanges, scheduleChangesRelations } from "./schema/schedule_changes/schema"
import { schedules, schedulesRelations } from "./schema/schedules/schema"

const sqlite = new Database(process.env.DATABASE_PATH || "./db/db.sqlite")
const db = drizzle(sqlite, {
    schema: { accounts, schedules, scheduleChanges, schedulesRelations, scheduleChangesRelations },
})

export default db
