<script lang="ts">
    import Modal from "$lib/components/Modal.svelte"
    import { days } from "$lib/utils/day"
    import { getHost } from "$lib/utils/host"
    import axios from "axios"
    import { createEventDispatcher } from "svelte"

    export let showUpdateModal: boolean
    export let currScheduleEntry: ScheduleEntry

    const dispatch = createEventDispatcher()

    async function updateScheduleEntry() {
        console.log(currScheduleEntry)

        const host = getHost(window)

        const { id, course, day, startTime, endTime, classroom, lecturer } = currScheduleEntry
        const res = await axios.patch(
            `${host}/api/schedule/${id}`,
            { course, day, startTime, endTime, classroom, lecturer },
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            },
        )

        if (res.status === 204) {
            showUpdateModal = false
            dispatch("fetchSchedule")
        }
    }
</script>

<Modal bind:showModal={showUpdateModal}>
    <h2 class="text-xl" slot="title">Update Schedule Entry Form</h2>
    <form on:submit|preventDefault={updateScheduleEntry} class="flex flex-col" slot="contents">
        <label class="my-3" for="day">Day</label>

        <select bind:value={currScheduleEntry.day} required class="p-2 bg-alt" id="day">
            {#each days as day (day.index)}
                <option selected={currScheduleEntry.day === day.index} value={day.index}>{day.name}</option>
            {/each}
        </select>

        <div class="flex flex-row justify-between mt-3 w-full md:gap-5">
            <div class="flex flex-col w-[45%] md:w-1/2">
                <label for="time-start">Start</label>
                <input
                    required
                    bind:value={currScheduleEntry.startTime}
                    id="time-start"
                    class="p-2 bg-alt"
                    type="text" />
            </div>
            <div class="flex flex-col w-[45%] md:w-1/2">
                <label for="time-end">End</label>
                <input required bind:value={currScheduleEntry.endTime} id="time-end" class="p-2 bg-alt" type="text" />
            </div>
        </div>

        <label class="my-3" for="classroom">Classoom</label>
        <input required bind:value={currScheduleEntry.classroom} id="classroom" class="p-2 bg-alt" type="text" />

        <label class="my-3" for="lecturer">Lecturer(s)</label>
        <input required bind:value={currScheduleEntry.lecturer} id="lecturer" class="p-2 bg-alt" type="text" />

        <div class="my-3">
            <button class="p-2 px-4 w-24 rounded bg-alt" type="submit">Update</button>
        </div>
    </form>
</Modal>
