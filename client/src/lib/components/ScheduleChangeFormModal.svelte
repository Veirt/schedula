<script lang="ts">
    import TimeInput from "./input/TimeInput.svelte"
    import TextInput from "./input/TextInput.svelte"
    import Modal from "$lib/components/Modal.svelte"
    import axios from "$lib/axios"
    import { schedule, uniqueSchedule } from "$lib/store/schedule"
    import { nextDay, type Day, formatRelative, isToday, compareAsc } from "date-fns"
    import { format } from "date-fns"
    import { createEventDispatcher } from "svelte"
    import Button from "./Button.svelte"

    export let showScheduleChangeModal: { open: boolean; form: string }
    export let currScheduleChange: Partial<CurrScheduleChange>

    let scheduledDateOptions: Date[] = []
    let isLoading = false

    const dispatch = createEventDispatcher()

    function getNextFourScheduledDate(day: Day, existingDate: string[]) {
        const result = []

        const today = new Date()
        let now = new Date(`${format(today, "y-MM-dd")} ${currScheduleChange.startTime}`)

        // edge case when we want to input at the same day as the original scheduled date
        if (isToday(currScheduleChange.date!) && compareAsc(today, now) !== 1) {
            // I would still want to show it if it's update form
            if (existingDate.includes(format(now, "y-MM-dd")) && showScheduleChangeModal.form === "create") {
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
        Object.values($schedule).forEach(async (sch) => {
            const found = sch.find((currEntry) => currScheduleChange.scheduleId == currEntry.id)
            if (found) {
                currScheduleChange = {
                    ...currScheduleChange,
                    scheduleId: found.id,
                    startTime: found.startTime,
                    endTime: found.endTime,
                    classroom: found.classroom,
                    date: found.date,
                }

                // get existing schedule changes to check if there is any schedule changes
                const existingScheduleChanges = await getExistingScheduleChanges(currScheduleChange.scheduleId!)
                const existingDate = existingScheduleChanges.map((sc: ScheduleChange) => sc.scheduledDate)

                // fill the 'Schedule Date' options
                scheduledDateOptions = getNextFourScheduledDate(found.day as Day, existingDate)

                // Reset the 'Schedule date' to prevent non-existing bind:value
                if (
                    !scheduledDateOptions
                        .map((sch) => format(sch, "y-MM-dd"))
                        .includes(currScheduleChange.scheduledDate!)
                ) {
                    currScheduleChange.scheduledDate = null
                } else {
                    currScheduleChange.scheduledDate = (currScheduleChange as ScheduleChange).scheduledDate
                }
            }
        })
    }

    $: {
        // trigger handleCourseChange when updating to fill out the scheduled date
        if (showScheduleChangeModal.open && showScheduleChangeModal.form === "update") {
            if (scheduledDateOptions.length === 0) handleCourseChange()
        }
    }

    $: {
        // reset the input when showScheduleChangeModal is closing
        if (!showScheduleChangeModal.open) {
            currScheduleChange = {
                scheduleId: null,
                classroom: "",
                startTime: "",
                endTime: "",
                type: null,
                scheduledDate: null,
                transitionedDate: "",
            }
            scheduledDateOptions = []
        }
    }

    async function createScheduleChange() {
        isLoading = true
        try {
            const res = await axios.post("/api/schedule/changes", currScheduleChange)

            if (res.status === 201) {
                showScheduleChangeModal = { open: false, form: "" }
                dispatch("fetchSchedule")
            }
        } catch (err) {
            // TODO: handle later
        }
        isLoading = false
    }

    async function updateScheduleChange() {
        isLoading = true
        try {
            const res = await axios.patch(`/api/schedule/changes/${currScheduleChange.id}`, currScheduleChange)

            if (res.status === 200) {
                showScheduleChangeModal = { open: false, form: "" }
                dispatch("fetchSchedule")
            }
        } catch (err) {
            // TODO: handle later
        }
        isLoading = false
    }
</script>

<Modal bind:showModal={showScheduleChangeModal.open}>
    <h2 class="text-xl capitalize" slot="title">{showScheduleChangeModal.form} Schedule Change Form</h2>
    <form
        on:submit|preventDefault={showScheduleChangeModal.form === "create"
            ? createScheduleChange
            : updateScheduleChange}
        class="flex flex-col"
        slot="contents">
        <label class="my-3" for="course">Course</label>
        <select
            required
            bind:value={currScheduleChange.scheduleId}
            disabled={showScheduleChangeModal.form === "update"}
            class:cursor-not-allowed={showScheduleChangeModal.form === "update"}
            class="p-2 bg-alt"
            id="course">
            <option value={null} selected hidden>Select a course</option>
            {#each $uniqueSchedule as schedule}
                <option value={schedule.id}>{schedule.course}</option>
            {/each}
        </select>

        {#if currScheduleChange.scheduleId}
            <label class="my-3" for="type">Type</label>
            <select
                required
                bind:value={currScheduleChange.type}
                on:change={handleCourseChange}
                class="p-2 bg-alt"
                id="type">
                <option value={null} selected hidden>Select the type of schedule change </option>
                <option value="transition">Transition / Pemindahan</option>
                <option value="cancellation">Cancellation / Jam Kosong</option>
            </select>
        {/if}

        {#if currScheduleChange.type}
            <label class="my-3" for="date">Scheduled Date</label>
            <select bind:value={currScheduleChange.scheduledDate} required class="p-2 bg-alt" id="date">
                <option hidden value={null}>Select the scheduled date</option>
                {#each scheduledDateOptions as opt}
                    <option value={format(opt, "y-MM-dd")}
                        >{format(opt, "iiii, dd MMM yyyy")} - {formatRelative(opt, new Date())}</option>
                {/each}
            </select>
        {/if}

        {#if currScheduleChange.type === "transition"}
            <label class="my-3" for="transitioned_date">Transitioned Date</label>
            <input
                bind:value={currScheduleChange.transitionedDate}
                required
                class="p-2 bg-alt"
                type="date"
                id="transitioned_date" />

            <TimeInput bind:startTime={currScheduleChange.startTime} bind:endTime={currScheduleChange.endTime} />

            <TextInput required bind:value={currScheduleChange.classroom} id="classroom" name="classroom" />
        {/if}

        <div class="my-3">
            <Button type="submit" disabled={isLoading} loading={isLoading}>
                {showScheduleChangeModal.form}
            </Button>
        </div>
    </form>
</Modal>
