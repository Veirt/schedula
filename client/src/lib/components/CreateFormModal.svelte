<script lang="ts">
    import axios from "$lib/axios"
    import Modal from "$lib/components/Modal.svelte"
    import { days } from "$lib/utils/day"
    import dayjs from "dayjs"
    import { createEventDispatcher } from "svelte"

    export let showCreateModal: boolean
    export let currentDay: number

    const dispatch = createEventDispatcher()

    let newScheduleEntry: ScheduleEntry = {
        course: "",
        classroom: "",
        lecturer: "",
        start_time: "",
        end_time: "",
        day: currentDay,
    }

    $: newScheduleEntry.day = currentDay

    async function createScheduleEntry() {
        const res = await axios.post("/api/schedule", newScheduleEntry, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        })

        // success
        if (res.status === 201) {
            // reset
            newScheduleEntry = {
                course: "",
                classroom: "",
                lecturer: "",
                start_time: "",
                end_time: "",
                day: currentDay,
            }

            showCreateModal = false
            dispatch("fetchSchedule")
        }
    }

    function getEndTime() {
        const timeRegex = new RegExp(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        if (newScheduleEntry.start_time.match(timeRegex)) {
            const date = new Date("2024-01-01 " + newScheduleEntry.start_time)

            // add 1 hour 30 minutes
            const addedTime = dayjs(date).add(1, "hour").add(30, "minute")
            const resultTime = addedTime.format("HH:mm")
            newScheduleEntry.end_time = resultTime
        }
    }
</script>

<Modal bind:showModal={showCreateModal}>
    <h2 class="text-xl" slot="title">Create Schedule Entry Form</h2>
    <form on:submit|preventDefault={createScheduleEntry} class="flex flex-col" slot="contents">
        <label class="my-3" for="course">Course</label>
        <input required bind:value={newScheduleEntry.course} id="course" class="p-2 bg-alt" type="text" />

        <label class="my-3" for="day">Day</label>
        <select required bind:value={newScheduleEntry.day} class="p-2 bg-alt" id="day">
            {#each days as day (day.index)}
                <option value={day.index}>{day.name}</option>
            {/each}
        </select>

        <div class="flex flex-row justify-between mt-3 w-full md:gap-5">
            <div class="flex flex-col w-[45%] md:w-1/2">
                <label for="time-start">Start</label>
                <input
                    required
                    on:change={getEndTime}
                    bind:value={newScheduleEntry.start_time}
                    id="time-start"
                    class="p-2 bg-alt"
                    type="text" />
            </div>
            <div class="flex flex-col w-[45%] md:w-1/2">
                <label for="time-end">End</label>
                <input required bind:value={newScheduleEntry.end_time} id="time-end" class="p-2 bg-alt" type="text" />
            </div>
        </div>

        <label class="my-3" for="classroom">Classoom</label>
        <input required bind:value={newScheduleEntry.classroom} id="classroom" class="p-2 bg-alt" type="text" />

        <label class="my-3" for="lecturer">Lecturer(s)</label>
        <input required bind:value={newScheduleEntry.lecturer} id="lecturer" class="p-2 bg-alt" type="text" />

        <div class="my-3">
            <button class="p-2 px-4 w-24 rounded bg-alt" type="submit">Create</button>
        </div>
    </form>
</Modal>
