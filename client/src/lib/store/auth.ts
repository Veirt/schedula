import { writable } from "svelte/store"

export const isLoggedIn = writable<boolean | null>(null)

export const account = writable({
    id: "",
    username: "",
    avatar: "",
})
