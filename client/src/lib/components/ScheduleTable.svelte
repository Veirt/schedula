<script lang="ts">
    import ConfirmModal from "$lib/components/ConfirmModal.svelte"
    import { getHost } from "$lib/utils/host"
    import axios from "axios"
    import { createEventDispatcher } from "svelte"
    import { isLoggedIn } from "$lib/store/auth"

    export let currentDay: number
    export let showUpdateModal: boolean
    export let currScheduleEntry: ScheduleEntry
    export let schedule: ScheduleEntry[][]

    let showConfirmModal = false
    let scheduleId: number | undefined

    const dispatch = createEventDispatcher()

    async function handleEdit(e: MouseEvent) {
        const target = e.target as HTMLButtonElement
        const scheduleId = parseInt(target.dataset.scheduleId!)

        const host = getHost(window)
        const res = await fetch(`${host}/api/schedule/${scheduleId}`)
        const resData = (await res.json()).data

        currScheduleEntry = resData.entry
        showUpdateModal = true
    }

    async function handleDelete() {
        const host = getHost(window)
        const res = await axios.delete(`${host}/api/schedule/${scheduleId}`)

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
                <td class="p-3 border b-secondary min-w-35">Time</td>
                <td class="p-3 border b-secondary min-w-25">Classroom</td>
                <td class="p-3 border b-secondary min-w-50 w-50">Course</td>
                <td class="p-3 border b-secondary min-w-50">Lecturer(s)</td>
                {#if $isLoggedIn}
                    <td class="p-3 text-center border b-secondary md:min-w-45">Action</td>
                {/if}
            </tr>
        </thead>
        <tbody>
            {#each schedule[currentDay] as scheduleEntry (scheduleEntry.id)}
                {@const lecturers = scheduleEntry.lecturer.split("/")}
                <tr>
                    <td class="p-3 text-center border b-secondary"
                        >{scheduleEntry.start_time} - {scheduleEntry.end_time}</td>
                    <td class="p-3 text-center border b-secondary">{scheduleEntry.classroom}</td>
                    <td class="p-3 border text-[13px] b-secondary">{scheduleEntry.course}</td>
                    <td class="p-3 border text-[12px] b-secondary">
                        <div class="flex flex-col">
                            {#each lecturers as lecturer (lecturer)}
                                <span class="p-1 my-1 rounded bg-alt">{lecturer}</span>
                            {/each}
                        </div>
                    </td>

                    {#if $isLoggedIn}
                        <td class="p-3 border b-secondary">
                            <div class="flex flex-col gap-2 justify-between m-auto md:flex-row">
                                <button
                                    on:click={(e) => {
                                        scheduleId = scheduleEntry.id
                                        handleEdit(e)
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
