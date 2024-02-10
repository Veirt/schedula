import { writable } from "svelte/store"

export const schedule = writable<Record<number, ScheduleThisWeek[]>>({})
export const uniqueSchedule = writable<Schedule[]>([])
schedule.subscribe((sch) => {
    const result: Schedule[] = []

    Object.values(sch).forEach((s) => {
        s.forEach((ss) => {
            if (!result.find((r) => r.id === ss.id)) {
                result.push(ss)
            }
        })
    })

    uniqueSchedule.set(result)
})
