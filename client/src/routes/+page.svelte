<script lang="ts">
    import ScheduleTable from "$lib/components/ScheduleTable.svelte"
    import WeekDayView from "$lib/components/WeekDayView.svelte"
    import { onMount } from "svelte"
    import { dev } from "$app/environment"

    let loading = true
    let currentDay = new Date().getDay()
    let schedule: never[][] = []

    const getSchedule = async () => {
        let host = window.location.host
        if (dev) {
            host = "http://localhost:3000"
        }

        return await fetch(`${host}/api/schedule`).then((res) => res.json())
    }

    onMount(() => {
        getSchedule().then((res) => {
            schedule = res.data
            loading = false
        })
    })
</script>

<main class="flex flex-col justify-center items-center mt-15">
    <h1 class="text-3xl">Schedule</h1>
    <WeekDayView bind:currentDay />
    {#if loading}
        <p>Loading...</p>
    {:else}
        <ScheduleTable {currentDay} {schedule} />
    {/if}
</main>
