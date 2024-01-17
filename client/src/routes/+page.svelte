<script lang="ts">
    import ScheduleTable from "$lib/components/ScheduleTable.svelte"
    import WeekDayView from "$lib/components/WeekDayView.svelte"
    import UpdateFormModal from "$lib/components/UpdateFormModal.svelte"
    import CreateFormModal from "$lib/components/CreateFormModal.svelte"
    import { onMount } from "svelte"
    import { getHost } from "$lib/utils/host"

    let loading = true
    let currentDay = new Date().getDay()
    let schedule: never[][] = []

    let showCreateModal = false
    let showUpdateModal = false
    let currScheduleEntry: ScheduleEntry = {
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

<UpdateFormModal bind:showUpdateModal bind:currScheduleEntry />
<CreateFormModal bind:showCreateModal />

<button on:click={() => (showCreateModal = true)} class="">Create</button>
<main class="flex flex-col justify-center items-center mt-15">
    <h1 class="text-3xl">Schedule</h1>
    <WeekDayView bind:currentDay />
    {#if loading}
        <p>Loading...</p>
    {:else}
        <ScheduleTable bind:currScheduleEntry bind:showUpdateModal {currentDay} {schedule} />
    {/if}
</main>
