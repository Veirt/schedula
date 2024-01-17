<script lang="ts">
    import Modal from "$lib/components/Modal.svelte"
    import { days } from "$lib/utils/day"
    import { getHost } from "$lib/utils/host"
    import axios from "axios"

    export let showCreateModal: boolean

    let newScheduleEntry: ScheduleEntry = {
        course: "",
        classroom: "",
        lecturer: "",
        startTime: "",
        endTime: "",
        day: 1,
    }

    async function createSchedule() {
        const host = getHost(window)

        const res = await axios.post(`${host}/api/schedule`, newScheduleEntry, {
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
                startTime: "",
                endTime: "",
                day: 1,
            }

            showCreateModal = false
        }
    }
</script>

<Modal bind:showModal={showCreateModal}>
    <h2 class="text-xl" slot="title">Create Schedule Entry Form</h2>
    <form on:submit|preventDefault={createSchedule} class="flex flex-col" slot="contents">
        <label class="my-3" for="course">Course</label>
        <input bind:value={newScheduleEntry.course} id="course" class="p-2 bg-alt" type="text" />

        <label class="my-3" for="day">Day</label>
        <select bind:value={newScheduleEntry.day} class="p-2 bg-alt" id="day">
            {#each days as day (day.index)}
                <option value={day.index}>{day.name}</option>
            {/each}
        </select>

        <div class="flex flex-row justify-between mt-3 w-full md:gap-5">
            <div class="flex flex-col w-[45%] md:w-1/2">
                <label for="time-start">Start</label>
                <input bind:value={newScheduleEntry.startTime} id="time-start" class="p-2 bg-alt" type="text" />
            </div>
            <div class="flex flex-col w-[45%] md:w-1/2">
                <label for="time-end">End</label>
                <input bind:value={newScheduleEntry.endTime} id="time-end" class="p-2 bg-alt" type="text" />
            </div>
        </div>

        <label class="my-3" for="classroom">Classoom</label>
        <input bind:value={newScheduleEntry.classroom} id="classroom" class="p-2 bg-alt" type="text" />

        <label class="my-3" for="lecturer">Lecturer(s)</label>
        <input bind:value={newScheduleEntry.lecturer} id="lecturer" class="p-2 bg-alt" type="text" />

        <div class="my-3">
            <input class="p-2 px-4 w-24 rounded bg-alt" type="submit" value="Create" />
        </div>
    </form>
</Modal>
