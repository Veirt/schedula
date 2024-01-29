<script lang="ts">
    import ScheduleTable from "$lib/components/ScheduleTable.svelte"
    import WeekDayView from "$lib/components/WeekDayView.svelte"
    import UpdateFormModal from "$lib/components/UpdateFormModal.svelte"
    import CreateFormModal from "$lib/components/CreateFormModal.svelte"
    import ScheduleChangeFormModal from "$lib/components/ScheduleChangeFormModal.svelte"
    import NavBar from "$lib/components/NavBar.svelte"
    import { dev } from "$app/environment"
    import { onMount } from "svelte"
    import axios from "$lib/axios"
    import { schedule } from "$lib/store/schedule"

    let loading = true
    let currentDay = new Date().getDay()

    let showCreateModal = false
    let showUpdateModal = false
    let showScheduleChangeModal = {
        open: false,
        form: "",
    }

    let currScheduleEntry: CurrScheduleEntry = {
        classroom: "",
        course: "",
        lecturer: "",
        startTime: "",
        endTime: "",
        day: 0,
    }
    let currScheduleChange: Partial<CurrScheduleChange> = {
        scheduleId: null,
        classroom: "",
        startTime: "",
        endTime: "",
        type: undefined,
        scheduledDate: undefined,
        transitionedDate: "",
    }

    let displayWeekend = false
    let displayAllEntry = false
    if (dev) {
        displayAllEntry = true
    }

    const fetchSchedule = async () => {
        const res = await axios.get("/api/schedule")

        schedule.set(res.data.data)
    }

    onMount(async () => {
        await fetchSchedule()
        loading = false
    })
</script>

<NavBar bind:showCreateModal bind:showScheduleChangeModal />

<CreateFormModal on:fetchSchedule={fetchSchedule} bind:showCreateModal bind:currentDay />
<UpdateFormModal on:fetchSchedule={fetchSchedule} bind:showUpdateModal bind:currScheduleEntry />
<ScheduleChangeFormModal on:fetchSchedule={fetchSchedule} bind:showScheduleChangeModal bind:currScheduleChange />

<main class="flex flex-col justify-center items-center mt-15">
    <h1 class="text-3xl">Schedule</h1>
    <WeekDayView bind:displayWeekend bind:currentDay />
    <div class="flex flex-row gap-5 my-3">
        <div>
            <input id="display-weekend" bind:checked={displayWeekend} type="checkbox" />
            <label class="select-none" for="display-weekend">Display Weekend?</label>
        </div>

        <div>
            <input id="display-all-entry" bind:checked={displayAllEntry} type="checkbox" />
            <label class="select-none" for="display-all-entry">Display All Entry?</label>
        </div>
    </div>

    {#if loading}
        <p>Loading...</p>
    {:else}
        <ScheduleTable
            on:fetchSchedule={fetchSchedule}
            bind:displayAllEntry
            bind:currScheduleEntry
            bind:currScheduleChange
            bind:showUpdateModal
            bind:showScheduleChangeModal
            {currentDay} />
    {/if}
</main>
