<script lang="ts">
    import ScheduleTable from "$lib/components/ScheduleTable.svelte"
    import WeekDayView from "$lib/components/WeekDayView.svelte"
    import UpdateFormModal from "$lib/components/UpdateFormModal.svelte"
    import CreateFormModal from "$lib/components/CreateFormModal.svelte"
    import ScheduleChangeFormModal from "$lib/components/ScheduleChangeFormModal.svelte"
    import NavBar from "$lib/components/NavBar.svelte"
    import { browser, dev } from "$app/environment"
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
    let currScheduleChange: CurrScheduleChange = {
        scheduleId: undefined,
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

    let nextNWeeks = 0
    $: if (browser) nextNWeeks, fetchSchedule(nextNWeeks)

    const fetchSchedule = async (nextNWeeks?: number) => {
        const n = nextNWeeks || 0
        const res = await axios.get(`/api/schedule?nextNWeeks=${n}`)

        schedule.set(res.data.data)

        loading = false
    }
</script>

<NavBar bind:showCreateModal bind:showScheduleChangeModal />

<CreateFormModal on:fetchSchedule={() => fetchSchedule(nextNWeeks)} bind:showCreateModal bind:currentDay />
<UpdateFormModal on:fetchSchedule={() => fetchSchedule(nextNWeeks)} bind:showUpdateModal bind:currScheduleEntry />
<ScheduleChangeFormModal
    on:fetchSchedule={() => fetchSchedule(nextNWeeks)}
    bind:showScheduleChangeModal
    bind:currScheduleChange />

<main class="flex flex-col justify-center items-center mt-15">
    <div class="flex gap-3 items-center">
        <button on:click={() => nextNWeeks--}><div class="i-bx:left-arrow w-1em h-1em"></div></button>
        <h1 class="text-2xl">Schedule</h1>
        <button on:click={() => nextNWeeks++}><div class="i-bx:right-arrow w-1em h-1em"></div> </button>
    </div>
    <h2 class="text-xl">
        {#if nextNWeeks == 0}
            This Week
        {:else if nextNWeeks == 1}
            Next Week
        {:else if nextNWeeks == -1}
            Last Week
        {:else if nextNWeeks > 1}
            Next {nextNWeeks} weeks
        {:else}
            Last {-nextNWeeks} week(s)
        {/if}
    </h2>
    <WeekDayView bind:displayWeekend bind:currentDay />
    <div class="flex flex-row gap-1 my-3">
        <div>
            <!-- <input id="display-weekend" bind:checked={displayWeekend} type="checkbox" /> -->
            <button
                class="p-2 border select-none b-alt"
                class:bg-alt={displayWeekend}
                on:click={() => (displayWeekend = !displayWeekend)}>Display Weekend</button>
        </div>

        <div>
            <button
                class="p-2 border select-none b-alt"
                class:bg-alt={displayAllEntry}
                on:click={() => (displayAllEntry = !displayAllEntry)}>Display All Entry</button>
        </div>
    </div>

    {#if loading}
        <p>Loading...</p>
    {:else}
        <ScheduleTable
            on:fetchSchedule={() => fetchSchedule(nextNWeeks)}
            bind:displayAllEntry
            bind:currScheduleEntry
            bind:currScheduleChange
            bind:showUpdateModal
            bind:showScheduleChangeModal
            {currentDay} />
    {/if}
</main>
