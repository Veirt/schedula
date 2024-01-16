<script lang="ts">
    import Modal from "$lib/components/Modal.svelte"
    import { days } from "$lib/utils/day"

    export let showFormModal: boolean
    export let currScheduleEntry: ScheduleEntry
</script>

<Modal bind:showModal={showFormModal}>
    <h2 class="text-xl" slot="title">Change Schedule Form</h2>
    <form class="flex flex-col" slot="contents">
        <label class="my-3" for="Day">Day</label>
        <select class="p-2 bg-alt" id="day">
            {#each days as day (day.index)}
                <option selected={currScheduleEntry.day === day.index} value={day.index}>{day.name}</option>
            {/each}
        </select>

        <div class="flex flex-row justify-between mt-3 w-full md:gap-5">
            <div class="flex flex-col w-[45%] md:w-1/2">
                <label for="time-start">Start</label>
                <input bind:value={currScheduleEntry.startTime} id="time-start" class="p-2 bg-alt" type="text" />
            </div>
            <div class="flex flex-col w-[45%] md:w-1/2">
                <label for="time-end">End</label>
                <input bind:value={currScheduleEntry.endTime} id="time-end" class="p-2 bg-alt" type="text" />
            </div>
        </div>

        <label class="my-3" for="classroom">Classoom</label>
        <input bind:value={currScheduleEntry.classroom} id="classroom" class="p-2 bg-alt" type="text" />

        <label class="my-3" for="lecturer">Lecturer(s)</label>
        <input bind:value={currScheduleEntry.lecturer} id="lecturer" class="p-2 bg-alt" type="text" />

        <div class="my-3">
            <input class="p-2 px-4 w-24 rounded bg-alt" type="submit" value="Confirm" />
        </div>
    </form>
</Modal>
