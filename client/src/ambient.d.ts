type ScheduleEntry = {
    id?: number
    course: string
    classroom: string
    lecturer: string
    start_time: string
    end_time: string
    date?: string
    type?: string
    day: number
}

type ScheduleChanges = {
    schedule_id: number
    classroom: string
    start_time: string
    end_time: string
    type: string
    scheduled_date: string
    transitioned_date: string
}
