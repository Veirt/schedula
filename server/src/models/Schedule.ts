import db from "../db"

export type ScheduleEntry = {
    id?: number
    course: string
    classroom: string
    lecturer: string
    startTime: string
    endTime: string
    day: number
}

type ScheduleEntryParams = {
    $id: number
    $course: string
    $classroom: string
    $lecturer: string
    $startTime: string
    $endTime: string
    $day: number
}

export class Schedule {
    private id?: number
    course: string
    classroom: string
    lecturer: string
    startTime: string
    endTime: string
    day: number

    constructor({ id, course, classroom, lecturer, startTime, endTime, day }: ScheduleEntry) {
        this.id = id
        this.course = course
        this.classroom = classroom
        this.lecturer = lecturer
        this.startTime = startTime
        this.endTime = endTime
        this.day = day
    }

    static init() {
        db.run(
            `CREATE TABLE IF NOT EXISTS schedule (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                course TEXT,
                classroom TEXT,
                lecturer TEXT,
                startTime TEXT,
                endTime TEXT,
                day INTEGER
             )`,
        )
    }

    static getAll() {
        return db.query<ScheduleEntry, null>("SELECT * FROM schedule ORDER BY startTime").all(null)
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

    static getFirst({ id, course, classroom, lecturer, startTime, endTime, day }: Partial<ScheduleEntry>) {
        return db
            .query<ScheduleEntry, Partial<ScheduleEntryParams>>(
                `SELECT * FROM schedule
                 WHERE id = $id OR
                 course = $course OR
                 classroom = $classroom OR
                 lecturer = $lecturer OR
                 startTime = $startTime OR
                 endTime = $endTime OR
                 day = $day`,
            )
            .get({
                $id: id,
                $course: course,
                $classroom: classroom,
                $lecturer: lecturer,
                $startTime: startTime,
                $endTime: endTime,
                $day: day,
            })
    }

    static get({ id, course, classroom, lecturer, startTime, endTime, day }: Partial<ScheduleEntry>) {
        return db
            .query(
                `SELECT * FROM schedule
                 WHERE id = $id OR
                 course = $coures OR
                 classroom = $classroom OR
                 lecturer = $lecturer OR
                 startTime = $startTime OR
                 endTime = $endTime OR
                 day = $day`,
            )
            .all(id!, course!, classroom!, lecturer!, startTime!, endTime!, day!)
    }

    insert() {
        const query = db.query(
            "INSERT INTO schedule (course, classroom, lecturer, startTime, endTime, day) VALUES ($course, $classroom, $lecturer, $startTime, $endTime, $day)",
        )

        query.run({
            $course: this.course,
            $classroom: this.classroom,
            $lecturer: this.lecturer,
            $startTime: this.startTime,
            $endTime: this.endTime,
            $day: this.day,
        })
    }

    update() {
        const query = db.query<null, ScheduleEntryParams>(
            `UPDATE schedule SET 
                 course = $course, 
                 classroom = $classroom, 
                 lecturer = $lecturer, 
                 startTime = $startTime, 
                 endTime = $endTime, 
                 day = $day 
                 WHERE id = $id`,
        )
        query.run({
            $id: this.id!,
            $course: this.course,
            $classroom: this.classroom,
            $lecturer: this.lecturer,
            $startTime: this.startTime,
            $endTime: this.endTime,
            $day: this.day,
        })
    }
}
