type ScheduleEntry = {
    id?: number
    course: string
    classroom: string
    lecturer: string
    start_time: string
    end_time: string
    date?: string
    day: number
    change?: ScheduleChange
}

type ScheduleChange = {
    sch_change_id: number
    schedule_id: number
    classroom: string
    start_time: string
    end_time: string
    type: string
    date?: string
    scheduled_date: string
    transitioned_date: string
}
