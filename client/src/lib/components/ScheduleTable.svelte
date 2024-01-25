<script lang="ts">
    import ConfirmModal from "$lib/components/ConfirmModal.svelte"
    import { createEventDispatcher } from "svelte"
    import { isLoggedIn } from "$lib/store/auth"
    import { schedule } from "$lib/store/schedule"
    import axios from "$lib/axios"

    export let currentDay: number
    export let showUpdateModal: boolean
    export let showScheduleChangeModal: { open: boolean; form: string }
    export let currScheduleEntry: ScheduleEntry
    export let currScheduleChange: Partial<ScheduleChange>
    export let displayAllEntry: boolean

    let showConfirmModal = false
    let scheduleId: number | undefined
    let scheduleChangeId: number | undefined

    const dispatch = createEventDispatcher()

    async function handleEditSchedule() {
        const res = await axios.get(`/api/schedule/${scheduleId}`)

        currScheduleEntry = res.data.data.entry
        showUpdateModal = true
    }

    async function handleEditScheduleChange() {
        const res = await axios.get(`/api/schedule/changes/${scheduleChangeId}`)
        currScheduleChange = res.data.data
        showScheduleChangeModal = { open: true, form: "update" }
    }

    async function handleDelete() {
        const res = await axios.delete(`/api/schedule/${scheduleId}`)

        if (res.status === 204) {
            dispatch("fetchSchedule")
        }

        showConfirmModal = false
    }
</script>

<div class="flex overflow-x-auto w-full md:justify-center">
    <table class="mt-5 border table-fixed b-secondary">
        <thead>
            <tr>
                <td class="p-3 border b-secondary w-35">Time</td>
                <td class="p-3 border b-secondary w-35">Classroom</td>
                <td class="p-3 w-80 border b-secondary">Course</td>
                <td class="p-3 border w-70 b-secondary">Lecturer(s)</td>
                {#if $isLoggedIn}
                    <td class="p-3 text-center border b-secondary md:min-w-45">Action</td>
                {/if}
            </tr>
        </thead>
        <tbody>
            {#each $schedule[currentDay] as scheduleEntry}
                {@const lecturers = scheduleEntry.lecturer.split("/")}
                <tr
                    class:hidden={(scheduleEntry.type === "cancellation" ||
                        scheduleEntry.type === "transition-before") &&
                        !displayAllEntry}
                    class:cancelled-row={scheduleEntry.change?.type === "cancellation"}
                    class:transition-before-row={scheduleEntry.change?.type === "transition-before"}
                    class:transition-after-row={scheduleEntry.change?.type === "transition-after"}>
                    <td class="p-3 text-center border b-secondary">
                        <span> {scheduleEntry.date}<br /></span>
                        {scheduleEntry.start_time} - {scheduleEntry.end_time}
                    </td>
                    <td class="p-3 text-center border b-secondary">{scheduleEntry.classroom}</td>
                    <td class="p-3 border text-[13px] b-secondary">{scheduleEntry.course}</td>
                    <td class="p-3 border text-[12px] b-secondary">
                        <div class="flex flex-col">
                            {#each lecturers as lecturer}
                                <span class="p-1 my-1 rounded bg-alt">{lecturer}</span>
                            {/each}
                        </div>
                    </td>

                    {#if $isLoggedIn}
                        <td class="p-3 border b-secondary">
                            <div class="flex flex-col gap-2 justify-between m-auto md:flex-row">
                                <button
                                    on:click={() => {
                                        // if it is not a schedule change
                                        if (!scheduleEntry.change?.type) {
                                            scheduleId = scheduleEntry.id
                                            handleEditSchedule()
                                        } else {
                                            scheduleChangeId = scheduleEntry.change.sch_change_id
                                            handleEditScheduleChange()
                                        }
                                    }}
                                    class="py-2 px-5 rounded bg-alt"
                                    data-schedule-id={scheduleEntry.id}>Edit</button>
                                <button
                                    on:click={() => {
                                        scheduleId = scheduleEntry.id
                                        showConfirmModal = true
                                    }}
                                    class="py-2 px-3 rounded bg-alt">Delete</button>
                            </div>
                        </td>
                    {/if}
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<ConfirmModal bind:showConfirmModal on:deleteConfirmed={handleDelete} />

<style lang="postcss">
    .transition-before-row {
        @apply bg-yellow-300/7;
    }

    .transition-after-row {
        @apply bg-green-300/7;
    }

    .cancelled-row {
        @apply bg-red-500/20;
    }
</style>
