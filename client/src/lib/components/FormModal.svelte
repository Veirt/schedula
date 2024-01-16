<script lang="ts">
    import Modal from "$lib/components/Modal.svelte"
    import { days } from "$lib/utils/day"

    export let showFormModal: boolean
    export let currScheduleEntry: ScheduleEntry
</script>

<Modal bind:showModal={showFormModal}>
    <h2 class="text-xl" slot="title">Change Schedule Form</h2>
    <div class="flex flex-col" slot="contents">
        <label class="my-3" for="Day">Day</label>
        <select class="p-2 bg-alt" id="day">
            {#each days as day (day.index)}
                <option selected={currScheduleEntry.dayIndex === day.index} value={day.index}>{day.name}</option>
            {/each}
        </select>

        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="my-3" for="time-start">Start</label>
        <input bind:value={currScheduleEntry.start} id="time-start" class="p-2 bg-alt" type="text" />

        <label class="my-3" for="time-end">End</label>
        <input bind:value={currScheduleEntry.end} id="time-end" class="p-2 bg-alt" type="text" />

        <label class="my-3" for="classroom">Classoom</label>
        <input bind:value={currScheduleEntry.classroom} id="classroom" class="p-2 bg-alt" type="text" />

        <label class="my-3" for="lecturer">Lecturer(s)</label>
        <input bind:value={currScheduleEntry.lecturer} id="lecturer" class="p-2 bg-alt" type="text" />
    </div>
</Modal>
