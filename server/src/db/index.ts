import { Database } from "bun:sqlite"

const db = new Database(Bun.env.DATABASE_PATH || "./db.sqlite")

export default db
