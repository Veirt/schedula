import db from "../db"

export type ScheduleEntry = {
    id?: number
    course: string
    classroom: string
    lecturer: string
    start_time: string
    end_time: string
    day: number
}

type ScheduleEntryParams = {
    $id: number
    $course: string
    $classroom: string
    $lecturer: string
    $start_time: string
    $end_time: string
    $day: number
}

export class Schedule {
    private id?: number
    course: string
    classroom: string
    lecturer: string
    start_time: string
    end_time: string
    day: number

    constructor({ id, course, classroom, lecturer, start_time, end_time, day }: ScheduleEntry) {
        this.id = id
        this.course = course
        this.classroom = classroom
        this.lecturer = lecturer
        this.start_time = start_time
        this.end_time = end_time
        this.day = day
    }

    static init() {
        db.run(
            `CREATE TABLE IF NOT EXISTS schedule (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                course TEXT,
                classroom TEXT,
                lecturer TEXT,
                start_time TEXT,
                end_time TEXT,
                day INTEGER
             )`,
        )
    }

    static getAll() {
        return db.query<ScheduleEntry, null>("SELECT * FROM schedule ORDER BY start_time").all(null)
    }

    /*
       Group by day. 
    */
    static getGroupedByDay() {
        let schedule = this.getAll()

        const groupedSchedule: ScheduleEntry[][] = [[], [], [], [], [], [], []]
        schedule.forEach((item) => {
            if (groupedSchedule[item.day]) {
                groupedSchedule[item.day].push(item)
            } else {
                groupedSchedule[item.day] = [item]
            }
        })

        return groupedSchedule

        // schedule.map
    }

    static getFirst({
        id,
        course,
        classroom,
        lecturer,
        start_time: start_time,
        end_time: end_time,
        day,
    }: Partial<ScheduleEntry>) {
        return db
            .query<ScheduleEntry, Partial<ScheduleEntryParams>>(
                `SELECT * FROM schedule
                 WHERE id = $id OR
                 course = $course OR
                 classroom = $classroom OR
                 lecturer = $lecturer OR
                 start_time = $start_time OR
                 end_time = $end_time OR
                 day = $day`,
            )
            .get({
                $id: id,
                $course: course,
                $classroom: classroom,
                $lecturer: lecturer,
                $start_time: start_time,
                $end_time: end_time,
                $day: day,
            })
    }

    static get({
        id,
        course,
        classroom,
        lecturer,
        start_time: start_time,
        end_time: end_time,
        day,
    }: Partial<ScheduleEntry>) {
        return db
            .query(
                `SELECT * FROM schedule
                 WHERE id = $id OR
                 course = $coures OR
                 classroom = $classroom OR
                 lecturer = $lecturer OR
                 start_time = $start_time OR
                 end_time = $end_time OR
                 day = $day`,
            )
            .all(id!, course!, classroom!, lecturer!, start_time!, end_time!, day!)
    }

    insert() {
        const query = db.query(
            "INSERT INTO schedule (course, classroom, lecturer, start_time, end_time, day) VALUES ($course, $classroom, $lecturer, $start_time, $end_time, $day)",
        )

        query.run({
            $course: this.course,
            $classroom: this.classroom,
            $lecturer: this.lecturer,
            $start_time: this.start_time,
            $end_time: this.end_time,
            $day: this.day,
        })
    }

    update() {
        const query = db.query<null, ScheduleEntryParams>(
            `UPDATE schedule SET 
                 course = $course, 
                 classroom = $classroom, 
                 lecturer = $lecturer, 
                 start_time = $start_time, 
                 end_time = $end_time, 
                 day = $day 
                 WHERE id = $id`,
        )
        query.run({
            $id: this.id!,
            $course: this.course,
            $classroom: this.classroom,
            $lecturer: this.lecturer,
            $start_time: this.start_time,
            $end_time: this.end_time,
            $day: this.day,
        })
    }

    delete() {
        const query = db.query<null, number>("DELETE FROM schedule WHERE id = ?")

        query.run(this.id!)
    }
}
