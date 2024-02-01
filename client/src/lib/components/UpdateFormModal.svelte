<script lang="ts">
    import Modal from "$lib/components/Modal.svelte"
    import TimeInput from "./input/TimeInput.svelte"
    import axios from "$lib/axios"
    import { days } from "$lib/utils/day"
    import { createEventDispatcher } from "svelte"
    import TextInput from "./input/TextInput.svelte"

    export let showUpdateModal: boolean
    export let currScheduleEntry: CurrScheduleEntry

    const dispatch = createEventDispatcher()

    async function updateScheduleEntry() {
        const { id, course, day, startTime, endTime, classroom, lecturer } = currScheduleEntry
        const res = await axios.patch(`/api/schedule/${id}`, {
            course,
            day,
            startTime,
            endTime,
            classroom,
            lecturer,
        })

        if (res.status === 200) {
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

        <TimeInput bind:startTime={currScheduleEntry.startTime} bind:endTime={currScheduleEntry.endTime} />

        <TextInput required bind:value={currScheduleEntry.classroom} name="classroom" id="classroom" />

        <TextInput required bind:value={currScheduleEntry.lecturer} name="Lecturer(s)" id="lecturer" />

        <div class="my-3">
            <button class="p-2 px-4 w-24 rounded bg-alt" type="submit">Update</button>
        </div>
    </form>
</Modal>
