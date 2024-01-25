import db from "../db"
import z from "zod"

export interface ScheduleChangeInterface {
    sch_change_id?: number
    schedule_id: number
    classroom: string
    start_time: string
    end_time: string
    type: string
    scheduled_date: string // YYYY-MM-DD
    transitioned_date: string // YYYY-MM-DD
}

export const scheduleChangeSchema = z.object({
    sch_change_id: z.number().optional(),
    schedule_id: z.number(),
    classroom: z.string(),
    start_time: z.string(),
    end_time: z.string(),
    type: z.string().refine((val) => val === "transition" || val === "cancellation"),
    scheduled_date: z.string(),
    transitioned_date: z.string(),
})

type ScheduleChangeParams = {
    $sch_change_id: number
    $schedule_id: number
    $classroom: string
    $start_time: string
    $end_time: string
    $type: string
    $scheduled_date: string // YYYY-MM-DD
    $transitioned_date: string // YYYY-MM-DD
}

type InsertScheduleChangeParams = Omit<ScheduleChangeParams, "$sch_change_id">
type UpdateScheduleChangeParams = Omit<ScheduleChangeParams, "$schedule_id" | "$lecturer">

export class ScheduleChange implements ScheduleChangeInterface {
    sch_change_id?: number
    schedule_id: number
    classroom: string
    start_time: string
    end_time: string
    type: string
    scheduled_date: string
    transitioned_date: string

    constructor(public data: ScheduleChangeInterface) {
        this.sch_change_id = data.sch_change_id
        this.schedule_id = data.schedule_id
        this.classroom = data.classroom
        this.start_time = data.start_time
        this.end_time = data.end_time
        this.type = data.type
        this.scheduled_date = data.scheduled_date
        this.transitioned_date = data.transitioned_date
    }

    static init() {
        db.run(
            `CREATE TABLE IF NOT EXISTS schedule_changes (
                sch_change_id INTEGER PRIMARY KEY AUTOINCREMENT,
                schedule_id INTEGER,
                classroom TEXT,
                start_time TEXT,
                end_time TEXT,
                type TEXT CHECK(type IN ('transition', 'cancellation')),
                scheduled_date DATE NOT NULL,
                transitioned_date DATE NULL,
                FOREIGN KEY(schedule_id) REFERENCES schedule(id) ON DELETE CASCADE
             )`,
        )
    }

    static getAll(schedule_id?: number) {
        if (schedule_id) {
            const result = db
                .query<ScheduleChangeInterface, number>(`SELECT * FROM schedule_changes WHERE schedule_id = ?`)
                .all(schedule_id)

            return result
        }

        const result = db
            .query<ScheduleChangeInterface, null>(`SELECT * FROM schedule_changes WHERE schedule_id`)
            .all(null)

        return result
    }

    static getById(id: number) {
        return db
            .query<ScheduleChangeInterface, number>("SELECT * FROM schedule_changes WHERE sch_change_id = ? LIMIT 1")
            .get(id)
    }

    insert() {
        db.query<null, InsertScheduleChangeParams>(
            "INSERT INTO schedule_changes VALUES (null, $schedule_id, $classroom, $start_time, $end_time, $type, $scheduled_date, $transitioned_date)",
        ).run({
            $schedule_id: this.schedule_id,
            $classroom: this.classroom,
            $start_time: this.start_time,
            $end_time: this.end_time,
            $type: this.type,
            $scheduled_date: this.scheduled_date,
            $transitioned_date: this.transitioned_date,
        })
    }

    update() {
        const query = db.query<null, UpdateScheduleChangeParams>(
            `UPDATE schedule_changes SET
                 classroom = $classroom, 
                 start_time = $start_time, 
                 end_time = $end_time, 
                 type = $type,
                 scheduled_date = $scheduled_date,
                 transitioned_date = $transitioned_date
                 WHERE sch_change_id = $sch_change_id`,
        )
        query.run({
            $sch_change_id: this.sch_change_id!,
            $classroom: this.classroom,
            $start_time: this.start_time,
            $end_time: this.end_time,
            $type: this.type,
            $scheduled_date: this.scheduled_date,
            $transitioned_date: this.transitioned_date,
        })
    }
}
