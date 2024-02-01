type Schedule = {
    id: number
    course: string
    classroom: string
    lecturer: string
    startTime: string
    endTime: string
    day: number
}

type CurrScheduleEntry = {
    id?: number
    course: string
    classroom: string
    lecturer: string
    startTime: string
    endTime: string
    day: number
}

type ScheduleThisWeek = Schedule & {
    transitionedDay: number | null
    scheduleChangeId: number | null
    type: string | null
    scheduledDate: string | null
    transitionedDate: string | null
    date: string
}

type ScheduleChange = {
    id: number
    scheduleId: number
    classroom: string
    startTime: string
    endTime: string
    type: string
    scheduledDate: string
    transitionedDate: string
}

type CurrScheduleChange = {
    id?: number
    scheduleId: number | null | undefined
    classroom: string
    startTime: string
    endTime: string
    type: string | null | undefined
    scheduledDate: string | null | undefined
    transitionedDate: string
    date?: string
}

type NewScheduleChange = Omit<ScheduleChange, "id">
