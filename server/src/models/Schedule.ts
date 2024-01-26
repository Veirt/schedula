import { add, eachDayOfInterval, format, nextMonday, startOfISOWeek } from "date-fns"
import db from "../db"
import { ScheduleChangeInterface } from "./ScheduleChanges"
import { z } from "zod"

interface ScheduleInterface {
    id?: number
    course: string
    classroom: string
    lecturer: string
    start_time: string
    end_time: string
    date?: string
    type?: string
    day: number
    change?: ScheduleChangeInterface
}

const timeRegex = new RegExp(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
export const scheduleSchema = z.object({
    id: z.number().optional(),
    course: z.string(),
    classroom: z.string(),
    lecturer: z.string(),
    start_time: z.string().regex(timeRegex, { message: "Start time is not valid" }),
    end_time: z.string().regex(timeRegex, { message: "End time is not valid" }),
    day: z.number().min(0).max(6),
})

type ScheduleEntryParams = {
    $id: number
    $course: string
    $classroom: string
    $lecturer: string
    $start_time: string
    $end_time: string
    $day: number
}

type GetScheduleEntryParams = Partial<ScheduleEntryParams>
type InsertScheduleEntryParams = Omit<ScheduleEntryParams, "$id">
type GetThisWeekParams = {
    $start_of_week: string
    $end_of_week: string
}

function groupByDay(schedule: ScheduleInterface[]) {
    const groupedSchedule: ScheduleInterface[][] = [[], [], [], [], [], [], []]
    schedule.forEach((item) => {
        if (groupedSchedule[item.day]) {
            groupedSchedule[item.day].push(item)
        } else {
            groupedSchedule[item.day] = [item]
        }
    })

    return groupedSchedule
}

function applyScheduleChanges(
    schedule: ScheduleInterface[][],
    scheduleChanges: ScheduleChangeInterface[],
    daysOfWeekFormatted: string[],
) {
    // Tipe Perubahan jadwal:
    // 1. Cancellation: Misalnya ada jadwal yang dibatalkan. Maka ambil scheduled_date nya, dan ubah type nya menjadi "cancellation"
    // 2. Transition
    scheduleChanges.forEach((change) => {
        // handle cancellation and transition-before
        const scheduledDay = new Date(change.scheduled_date).getDay()
        const idx = schedule[scheduledDay].findIndex((sch) => {
            return sch.id === change.schedule_id && sch.date === change.scheduled_date
        })
        let type = change.type === "transition" ? "transition-before" : change.type
        schedule[scheduledDay][idx] = {
            ...schedule[scheduledDay][idx],
            change: {
                ...change,
                type,
            },
        }

        if (change.type === "cancellation") return

        // handle transition-after
        const transitionedDay = new Date(change.transitioned_date).getDay()
        const transitionedDate = daysOfWeekFormatted[transitionedDay]
        const initialDay = new Date(change.scheduled_date).getDay()
        const original = schedule[initialDay].find((sch) => sch.id === change.schedule_id)!
        if (transitionedDate === change.transitioned_date)
            schedule[transitionedDay].push({
                ...original,
                change: {
                    ...change,
                    type: "transition-after",
                },
            })
    })

    // sort by start_time
    schedule = schedule.map((todaySchedule) => {
        return todaySchedule.sort((a, b) => {
            return a.start_time > b.start_time ? 1 : -1
        })
    })

    return schedule
}

export class Schedule {
    id?: number
    course: string
    classroom: string
    lecturer: string
    start_time: string
    end_time: string
    day: number
    constructor(schedule: {
        id?: number
        course: string
        classroom: string
        lecturer: string
        start_time: string
        end_time: string
        day: number
    }) {
        this.id = schedule.id
        this.course = schedule.course
        this.classroom = schedule.classroom
        this.lecturer = schedule.lecturer
        this.start_time = schedule.start_time
        this.end_time = schedule.end_time
        this.day = schedule.day
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
        return db.query<ScheduleInterface, null>("SELECT * FROM schedule ORDER BY start_time").all(null)
    }

    static getThisWeek() {
        const startOfWeek = startOfISOWeek(new Date())

        const daysOfWeek = eachDayOfInterval({
            start: startOfWeek,
            end: add(startOfWeek, { days: 6 }),
        })

        let daysOfWeekFormatted: string[] = []
        daysOfWeek.forEach((day) => {
            // format it to YYYY-MM-DD that database understands
            const newFormat = format(day, "y-MM-dd")
            daysOfWeekFormatted.push(newFormat)
        })

        // put sunday at the front
        const sunday = daysOfWeekFormatted.pop()
        daysOfWeekFormatted.unshift(sunday!)

        let schedule = groupByDay(this.getAll())
        schedule = schedule.map((todaySchedule, day) => {
            return todaySchedule.map((entry) => {
                entry.date = daysOfWeekFormatted[day]

                return entry
            })
        })

        const query = db.query<ScheduleChangeInterface, GetThisWeekParams>(`
        SELECT * FROM schedule_changes
        WHERE 
            CASE 
            WHEN type = 'transition' THEN scheduled_date BETWEEN $start_of_week AND $end_of_week OR transitioned_date BETWEEN $start_of_week AND $end_of_week
            WHEN type = 'cancellation' THEN scheduled_date BETWEEN $start_of_week AND $end_of_week
          END
        `)
        const scheduleChanges = query.all({
            $start_of_week: daysOfWeekFormatted[1],
            $end_of_week: daysOfWeekFormatted[0],
        })

        schedule = applyScheduleChanges(schedule, scheduleChanges, daysOfWeekFormatted)

        return schedule
    }

    static getFirst({
        id,
        course,
        classroom,
        lecturer,
        start_time: start_time,
        end_time: end_time,
        day,
    }: Partial<ScheduleInterface>) {
        return db
            .query<ScheduleInterface, Partial<ScheduleEntryParams>>(
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
    }: Partial<ScheduleInterface>) {
        return db
            .query<ScheduleInterface, GetScheduleEntryParams>(
                `SELECT * FROM schedule
                 WHERE id = $id OR
                 course = $course OR
                 classroom = $classroom OR
                 lecturer = $lecturer OR
                 start_time = $start_time OR
                 end_time = $end_time OR
                 day = $day
            `,
            )
            .all({
                $id: id,
                $course: course,
                $classroom: classroom,
                $lecturer: lecturer,
                $start_time: start_time,
                $end_time: end_time,
                $day: day,
            })
    }

    insert() {
        db.query<null, InsertScheduleEntryParams>(
            "INSERT INTO schedule (course, classroom, lecturer, start_time, end_time, day) VALUES ($course, $classroom, $lecturer, $start_time, $end_time, $day)",
        ).run({
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
