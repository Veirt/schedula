import { writable } from "svelte/store"

type Schedule = ScheduleEntry & Partial<ScheduleChange>

export const schedule = writable<Schedule[][]>([[]])
