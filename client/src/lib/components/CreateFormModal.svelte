<script lang="ts">
    import Modal from "$lib/components/Modal.svelte"
    import TextInput from "$lib/components/input/TextInput.svelte"
    import axios from "$lib/axios"
    import { days } from "$lib/utils/day"
    import { createEventDispatcher } from "svelte"
    import TimeInput from "./input/TimeInput.svelte"

    export let showCreateModal: boolean
    export let currentDay: number

    const dispatch = createEventDispatcher()

    let newScheduleEntry: Omit<CurrScheduleEntry, "id"> = {
        course: "",
        classroom: "",
        lecturer: "",
        startTime: "",
        endTime: "",
        day: currentDay,
    }

    $: newScheduleEntry.day = currentDay

    async function createScheduleEntry() {
        const res = await axios.post("/api/schedule", newScheduleEntry)

        // success
        if (res.status === 201) {
            // reset
            newScheduleEntry = {
                course: "",
                classroom: "",
                lecturer: "",
                startTime: "",
                endTime: "",
                day: currentDay,
            }

            showCreateModal = false
            dispatch("fetchSchedule")
        }
    }
</script>

<Modal bind:showModal={showCreateModal}>
    <h2 class="text-xl" slot="title">Create Schedule Entry Form</h2>
    <form on:submit|preventDefault={createScheduleEntry} class="flex flex-col" slot="contents">
        <TextInput required={true} bind:value={newScheduleEntry.course} name="course" id="course" />

        <label class="my-3" for="day">Day</label>
        <select required bind:value={newScheduleEntry.day} class="p-2 bg-alt" id="day">
            {#each days as day (day.index)}
                <option value={day.index}>{day.name}</option>
            {/each}
        </select>

        <TimeInput bind:startTime={newScheduleEntry.startTime} bind:endTime={newScheduleEntry.endTime} />

        <TextInput bind:value={newScheduleEntry.classroom} required name="classroom" id="classroom" />

        <TextInput bind:value={newScheduleEntry.lecturer} required name="Lecturer(s)" id="lecturer" />

        <div class="my-3">
            <button class="p-2 px-4 w-24 rounded bg-alt" type="submit">Create</button>
        </div>
    </form>
</Modal>
