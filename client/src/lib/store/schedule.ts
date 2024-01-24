import { writable } from "svelte/store"

export const schedule = writable<ScheduleEntry[][]>([[]])
