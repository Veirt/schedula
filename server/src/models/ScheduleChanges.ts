import db from "../db"

export interface ScheduleChangesInterface {
    schedule_id: number
    classroom: string
    start_time: string
    end_time: string
    day: number
    date: string // YYYY-MM-DD
}

export class ScheduleChanges implements ScheduleChangesInterface {
    public schedule_id: number
    public classroom: string
    public start_time: string
    public end_time: string
    public day: number
    public date: string

    constructor(public data: ScheduleChangesInterface) {
        this.schedule_id = data.schedule_id
        this.classroom = data.classroom
        this.start_time = data.start_time
        this.end_time = data.end_time
        this.day = data.day
        this.date = data.date
    }

    static init() {
        db.run(
            `CREATE TABLE IF NOT EXISTS schedule_changes (
                schedule_id INTEGER,
                classroom TEXT,
                start_time TEXT,
                end_time TEXT,
                day INTEGER,
                date DATE,
                FOREIGN KEY(schedule_id) REFERENCES schedule(id)
             )`,
        )
    }

    static getAll() {
        const result = db.query<ScheduleChangesInterface, null>(`SELECT * FROM schedule_changes`).all(null)

        return result
    }
}
