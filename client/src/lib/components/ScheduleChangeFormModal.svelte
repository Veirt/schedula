<script lang="ts">
    import axios from "$lib/axios"
    import Modal from "$lib/components/Modal.svelte"
    import { schedule } from "$lib/store/schedule"
    import { nextDay, type Day, formatRelative, isToday, compareAsc } from "date-fns"
    import { format } from "date-fns"
    import { dayArray } from "$lib/utils/day"
    import { createEventDispatcher } from "svelte"

    export let showScheduleChangeModal: boolean

    const dispatch = createEventDispatcher()

    let scheduleChange: Partial<ScheduleChanges> & Partial<ScheduleEntry> = {
        schedule_id: undefined,
        classroom: "",
        start_time: "",
        end_time: "",
        type: undefined,
        scheduled_date: undefined,
        transitioned_date: "",
    }

    let scheduledDateOptions: Date[] = []

    function getScheduledDate(day: Day) {
        const result = []

        const today = new Date()
        let now = new Date(`${format(today, "y-MM-dd")} ${scheduleChange.start_time}`)

        // edge case when we want to input at the same day as the original scheduled date
        if (isToday(scheduleChange.date!) && compareAsc(today, now) !== 1) {
            result.push(now)
        }

        for (let i = 0; i < 4; i++) {
            now = nextDay(now, day)
            result.push(now)
        }

        return result
    }

    function handleChangeCourseSelect() {
        // get data of the course
        $schedule.forEach((sch) => {
            const found = sch.find((currEntry) => scheduleChange.schedule_id == currEntry.id)
            if (found) {
                scheduleChange = { ...scheduleChange, ...found }
                scheduledDateOptions = getScheduledDate(scheduleChange.day as Day)
                scheduleChange.scheduled_date = undefined
            }
        })
    }

    async function createScheduleChange() {
        try {
            const res = await axios.post("/api/schedule/changes", scheduleChange)

            if (res.status === 201) {
                showScheduleChangeModal = false
                dispatch("fetchSchedule")
            }
        } catch (err) {
            // TODO: handle later
        }
    }
</script>

<Modal bind:showModal={showScheduleChangeModal}>
    <h2 class="text-xl" slot="title">Create Schedule Change</h2>
    <form on:submit|preventDefault={createScheduleChange} class="flex flex-col" slot="contents">
        <label class="my-3" for="course">Course</label>
        <select
            required
            bind:value={scheduleChange.schedule_id}
            on:change={handleChangeCourseSelect}
            class="p-2 bg-alt"
            id="course">
            <option value={undefined} selected hidden>Select a course</option>
            {#each $schedule as scheduleEachDay}
                {#each scheduleEachDay as scheduleEntry}
                    <option value={scheduleEntry.id}>{dayArray[scheduleEntry.day]} - {scheduleEntry.course}</option>
                {/each}
            {/each}
        </select>

        <label class="my-3" for="type">Type</label>
        <select required bind:value={scheduleChange.type} class="p-2 bg-alt" id="type">
            <option value={undefined} selected hidden>Select the type of schedule change </option>
            <option value="transition">Transition / Pemindahan</option>
            <option value="cancellation">Cancellation / Jam Kosong</option>
        </select>

        {#if scheduleChange.type}
            <label class="my-3" for="date">Scheduled Date</label>
            <select bind:value={scheduleChange.scheduled_date} required class="p-2 bg-alt" id="date">
                <option hidden value={undefined}>Select the scheduled date</option>
                {#each scheduledDateOptions as opt}
                    <option value={format(opt, "y-MM-dd")}
                        >{format(opt, "iiii, dd MMM yyyy")} - {formatRelative(opt, new Date())}</option>
                {/each}
            </select>
        {/if}

        {#if scheduleChange.type === "transition"}
            <label class="my-3" for="transitioned_date">Transitioned Date</label>
            <input
                bind:value={scheduleChange.transitioned_date}
                required
                class="p-2 bg-alt"
                type="date"
                id="transitioned_date" />

            <div class="flex flex-row justify-between mt-3 w-full md:gap-5">
                <div class="flex flex-col w-[45%] md:w-1/2">
                    <label for="time-start">Start</label>
                    <input
                        required
                        bind:value={scheduleChange.start_time}
                        id="time-start"
                        class="p-2 bg-alt"
                        type="text" />
                </div>
                <div class="flex flex-col w-[45%] md:w-1/2">
                    <label for="time-end">End</label>
                    <input required bind:value={scheduleChange.end_time} id="time-end" class="p-2 bg-alt" type="text" />
                </div>
            </div>

            <label class="my-3" for="classroom">Classoom</label>
            <input required bind:value={scheduleChange.classroom} id="classroom" class="p-2 bg-alt" type="text" />
        {/if}

        <div class="my-3">
            <button class="p-2 px-4 w-24 rounded bg-alt" type="submit">Create</button>
        </div>
    </form>
</Modal>
