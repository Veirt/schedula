import db from "../db"

export class Schedule {
    private id?: number
    course: string
    classroom: string
    lecturer: string
    startTime: string
    endTime: string
    day: number

    constructor(course: string, classroom: string, lecturer: string, startTime: string, endTime: string, day: number) {
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
        return db.query("SELECT * FROM schedule").all()
    }

    /*
       Group by day. 
    */
    static getGroupedByDay() {
        let schedule = this.getAll() as Schedule[]

        const groupedSchedule: Schedule[][] = [[], [], [], [], [], [], []]
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

    static insert(schedule: Schedule) {
        const query = db.query(
            "INSERT INTO schedule (course, classroom, lecturer, startTime, endTime, day) VALUES ($course, $classroom, $lecturer, $startTime, $endTime, $day)",
        )

        query.run({
            $course: schedule.course,
            $classroom: schedule.classroom,
            $lecturer: schedule.lecturer,
            $startTime: schedule.startTime,
            $endTime: schedule.endTime,
            $day: schedule.day,
        })
    }
}
