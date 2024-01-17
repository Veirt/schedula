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

    const fetchSchedule = async () => {
        const host = getHost(window)

        const res = await fetch(`${host}/api/schedule`).then((res) => res.json())
        schedule = res.data
    }

    onMount(async () => {
        await fetchSchedule()
        loading = false
    })
</script>

<UpdateFormModal on:fetchSchedule={fetchSchedule} bind:showUpdateModal bind:currScheduleEntry />
<CreateFormModal on:fetchSchedule={fetchSchedule} bind:currentDay bind:showCreateModal />

<button on:click={() => (showCreateModal = true)} class="">Create</button>
<main class="flex flex-col justify-center items-center mt-15">
    <h1 class="text-3xl">Schedule</h1>
    <WeekDayView bind:currentDay />
    {#if loading}
        <p>Loading...</p>
    {:else}
        <ScheduleTable bind:currScheduleEntry bind:showUpdateModal {currentDay} bind:schedule />
    {/if}
</main>
