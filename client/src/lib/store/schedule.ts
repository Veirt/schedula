import { writable } from "svelte/store"

export const schedule = writable<Record<number, ScheduleThisWeek[]>>({})
