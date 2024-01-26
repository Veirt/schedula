<script lang="ts">
    import axios from "$lib/axios"
    import Modal from "$lib/components/Modal.svelte"
    import { schedule } from "$lib/store/schedule"
    import { nextDay, type Day, formatRelative, isToday, compareAsc } from "date-fns"
    import { format } from "date-fns"
    import { dayArray } from "$lib/utils/day"
    import { createEventDispatcher } from "svelte"

    export let showScheduleChangeModal: { open: boolean; form: string }

    const dispatch = createEventDispatcher()

    export let currScheduleChange: Partial<ScheduleChange>
    let scheduledDateOptions: Date[] = []

    function getNextFourScheduledDate(day: Day, existingDate: string[]) {
        const result = []

        const today = new Date()
        let now = new Date(`${format(today, "y-MM-dd")} ${currScheduleChange.start_time}`)

        // edge case when we want to input at the same day as the original scheduled date
        if (isToday(currScheduleChange.date!) && compareAsc(today, now) !== 1) {
            if (existingDate.includes(format(now, "y-MM-dd"))) {
                now = nextDay(now, day)
            } else {
                result.push(now)
            }
        }

        while (result.length < 4) {
            now = nextDay(now, day)
            if (existingDate.includes(format(now, "y-MM-dd")) && showScheduleChangeModal.form === "create") continue
            result.push(now)
        }

        return result
    }

    async function getExistingScheduleChanges(scheduleId: number) {
        const params = new URLSearchParams({
            schedule_id: scheduleId.toString(),
        })
        const res = await axios.get(`/api/schedule/changes?${params}`)

        return res.data.data
    }

    function handleCourseChange() {
        // get data of the course
        $schedule.forEach(async (sch) => {
            const found = sch.find((currEntry) => currScheduleChange.schedule_id == currEntry.id)
            if (found) {
                currScheduleChange = { ...currScheduleChange, ...found }

                // get existing schedule changes to check if there is any schedule changes
                const existingScheduleChanges = await getExistingScheduleChanges(currScheduleChange.schedule_id!)
                const existingDate = existingScheduleChanges.map((sc: ScheduleChange) => sc.scheduled_date)

                // fill the 'Schedule Date' options
                scheduledDateOptions = getNextFourScheduledDate(found.day as Day, existingDate)

                // Reset the 'Schedule date' to prevent non-existing bind:value
                if (
                    !scheduledDateOptions
                        .map((sch) => format(sch, "y-MM-dd"))
                        .includes(currScheduleChange.scheduled_date!)
                ) {
                    currScheduleChange.scheduled_date = undefined
                } else {
                    currScheduleChange.scheduled_date = (currScheduleChange as ScheduleEntry).change?.scheduled_date
                }
            }
        })
    }

    // trigger handleCourseChange when updating to fill out the scheduled date
    $: {
        if (showScheduleChangeModal.open && showScheduleChangeModal.form === "update") {
            if (scheduledDateOptions.length === 0) handleCourseChange()
        }
    }

    $: {
        // reset the input when showScheduleChangeModal is closing
        if (!showScheduleChangeModal.open) {
            currScheduleChange = {
                schedule_id: undefined,
                classroom: "",
                start_time: "",
                end_time: "",
                type: undefined,
                scheduled_date: undefined,
                transitioned_date: "",
            }
            scheduledDateOptions = []
        }
    }

    async function createScheduleChange() {
        try {
            const res = await axios.post("/api/schedule/changes", currScheduleChange)

            if (res.status === 201) {
                showScheduleChangeModal = { open: false, form: "" }
                dispatch("fetchSchedule")
            }
        } catch (err) {
            // TODO: handle later
        }
    }

    async function updateScheduleChange() {
        try {
            const res = await axios.patch(
                `/api/schedule/changes/${currScheduleChange.sch_change_id}`,
                currScheduleChange,
            )

            if (res.status === 200) {
                showScheduleChangeModal = { open: false, form: "" }
                dispatch("fetchSchedule")
            }
        } catch (err) {
            // TODO: handle later
        }
    }
</script>

<Modal bind:showModal={showScheduleChangeModal.open}>
    <h2 class="text-xl" slot="title">Schedule Change Form: {showScheduleChangeModal.form}</h2>
    <form
        on:submit|preventDefault={showScheduleChangeModal.form === "create"
            ? createScheduleChange
            : updateScheduleChange}
        class="flex flex-col"
        slot="contents">
        <label class="my-3" for="course">Course</label>
        <select
            required
            bind:value={currScheduleChange.schedule_id}
            on:change={handleCourseChange}
            disabled={showScheduleChangeModal.form === "update"}
            class:cursor-not-allowed={showScheduleChangeModal.form === "update"}
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
        <select required bind:value={currScheduleChange.type} class="p-2 bg-alt" id="type">
            <option value={undefined} selected hidden>Select the type of schedule change </option>
            <option value="transition">Transition / Pemindahan</option>
            <option value="cancellation">Cancellation / Jam Kosong</option>
        </select>

        {#if currScheduleChange.type}
            <label class="my-3" for="date">Scheduled Date</label>
            <select bind:value={currScheduleChange.scheduled_date} required class="p-2 bg-alt" id="date">
                <option hidden value={undefined}>Select the scheduled date</option>
                {#each scheduledDateOptions as opt}
                    <option value={format(opt, "y-MM-dd")}
                        >{format(opt, "iiii, dd MMM yyyy")} - {formatRelative(opt, new Date())}</option>
                {/each}
            </select>
        {/if}

        {#if currScheduleChange.type === "transition"}
            <label class="my-3" for="transitioned_date">Transitioned Date</label>
            <input
                bind:value={currScheduleChange.transitioned_date}
                required
                class="p-2 bg-alt"
                type="date"
                id="transitioned_date" />

            <div class="flex flex-row justify-between mt-3 w-full md:gap-5">
                <div class="flex flex-col w-[45%] md:w-1/2">
                    <label for="time-start">Start</label>
                    <input
                        required
                        bind:value={currScheduleChange.start_time}
                        id="time-start"
                        class="p-2 bg-alt"
                        type="text" />
                </div>
                <div class="flex flex-col w-[45%] md:w-1/2">
                    <label for="time-end">End</label>
                    <input
                        required
                        bind:value={currScheduleChange.end_time}
                        id="time-end"
                        class="p-2 bg-alt"
                        type="text" />
                </div>
            </div>

            <label class="my-3" for="classroom">Classoom</label>
            <input required bind:value={currScheduleChange.classroom} id="classroom" class="p-2 bg-alt" type="text" />
        {/if}

        <div class="my-3">
            <button class="p-2 px-4 w-24 capitalize rounded bg-alt" type="submit">
                {showScheduleChangeModal.form}
            </button>
        </div>
    </form>
</Modal>
