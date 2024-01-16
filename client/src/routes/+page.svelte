<script lang="ts">
    import ScheduleTable from "$lib/components/ScheduleTable.svelte"
    import WeekDayView from "$lib/components/WeekDayView.svelte"
    import FormModal from "$lib/components/FormModal.svelte"
    import { onMount } from "svelte"
    import { getHost } from "$lib/utils/host"

    let loading = true
    let currentDay = new Date().getDay()
    let schedule: never[][] = []

    let showFormModal = false
    let currScheduleEntry: ScheduleEntry = {
        id: 0,
        classroom: "",
        course: "",
        lecturer: "",
        startTime: "",
        endTime: "",
        day: 0,
    }

    const getSchedule = async () => {
        const host = getHost(window)
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
    <FormModal bind:showFormModal bind:currScheduleEntry />
    <WeekDayView bind:currentDay />
    {#if loading}
        <p>Loading...</p>
    {:else}
        <ScheduleTable bind:currScheduleEntry bind:showFormModal {currentDay} {schedule} />
    {/if}
</main>
