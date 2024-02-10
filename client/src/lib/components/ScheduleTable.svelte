<script lang="ts">
    import ConfirmModal from "$lib/components/ConfirmModal.svelte"
    import { createEventDispatcher } from "svelte"
    import { isLoggedIn } from "$lib/store/auth"
    import { schedule } from "$lib/store/schedule"
    import axios from "$lib/axios"
    import { compareAsc } from "date-fns"

    export let currentDay: number
    export let showUpdateModal: boolean
    export let showScheduleChangeModal: { open: boolean; form: string }
    export let currScheduleEntry: CurrScheduleEntry
    export let currScheduleChange: CurrScheduleChange
    export let displayAllEntry: boolean

    let showDelScheduleConfirm = false
    let showDelScheduleChangeConfirm = false
    let scheduleId: number | undefined
    let scheduleChangeId: number | null

    let scheduleView = "table"
    let innerWidth = 0
    let innerHeight = 0

    $: if (innerWidth < 768) {
        scheduleView = "card"
    } else {
        scheduleView = "table"
    }

    const dispatch = createEventDispatcher()
    const now = new Date()

    async function handleEditSchedule() {
        const res = await axios.get(`/api/schedule/${scheduleId}`)

        currScheduleEntry = res.data.data
        showUpdateModal = true
    }

    async function handleDeleteSchedule() {
        const res = await axios.delete(`/api/schedule/${scheduleId}`)

        if (res.status === 200) {
            dispatch("fetchSchedule")
        }

        showDelScheduleConfirm = false
    }

    async function handleEditScheduleChange() {
        const res = await axios.get(`/api/schedule/changes/${scheduleChangeId}`)
        currScheduleChange = res.data.data
        showScheduleChangeModal = { open: true, form: "update" }
    }

    async function handleDeleteScheduleChange() {
        const res = await axios.delete(`/api/schedule/changes/${scheduleChangeId}`)

        if (res.status === 200) {
            dispatch("fetchSchedule")
        }

        showDelScheduleChangeConfirm = false
    }

    function isChangeDeletable(scheduleEntry: ScheduleThisWeek) {
        if (scheduleEntry.type) {
            return now > new Date(`${scheduleEntry.date} ${scheduleEntry.endTime}`)
        }

        return false
    }
</script>

<ConfirmModal bind:showConfirmModal={showDelScheduleConfirm} on:deleteConfirmed={handleDeleteSchedule}>
    Are you sure you want to delete this entry?
</ConfirmModal>

<ConfirmModal bind:showConfirmModal={showDelScheduleChangeConfirm} on:deleteConfirmed={handleDeleteScheduleChange}>
    Are you sure you want to delete this schedule change?
</ConfirmModal>

<svelte:window bind:innerWidth bind:innerHeight />

<div>
    {#if $schedule[currentDay].length > 0}
        {@const isTransitionBeforeExist =
            $schedule[currentDay].find((sch) => sch.type === "transition-before") !== undefined}
        {@const isTransitionAfterExist =
            $schedule[currentDay].find((sch) => sch.type === "transition-after") !== undefined}
        {@const isCancellationExist = $schedule[currentDay].find((sch) => sch.type === "cancellation") !== undefined}
        {@const isDoneExist = $schedule[currentDay].some((sch) => compareAsc(now, `${sch.date} ${sch.endTime}`) === 1)}

        <div class="flex flex-col gap-2 items-start py-3 text-sm md:flex-row md:gap-5 px-15">
            <div class:!hidden={!isTransitionBeforeExist} class="flex gap-3 items-center">
                <div class="w-4 h-4 transition-before-row"></div>
                <p>Pemindahan (Sebelum)</p>
            </div>

            <div class:!hidden={!isTransitionAfterExist} class="flex gap-3 items-center">
                <div class="w-4 h-4 transition-after-row"></div>
                <p>Pemindahan (Sesudah)</p>
            </div>

            <div class:!hidden={!isCancellationExist} class="flex gap-3 items-center">
                <div class="w-4 h-4 cancelled-row"></div>
                <p>Pembatalan</p>
            </div>

            <div class:!hidden={!isDoneExist} class="flex gap-3 items-center">
                <div class="w-4 h-4 done-row"></div>
                <p>Selesai</p>
            </div>
        </div>
    {/if}
</div>

{#if scheduleView === "table" && $schedule[currentDay].length > 0}
    <div class="flex overflow-x-auto w-full md:w-[90%] md:justify-center">
        <table class="mt-5 mb-10 border table-fixed b-secondary">
            <thead>
                <tr>
                    <td class="p-3 text-center border b-secondary w-35">Time</td>
                    <td class="p-3 text-center border b-secondary w-35">Classroom</td>
                    <td class="p-3 w-80 text-center border b-secondary">Course</td>
                    <td class="p-3 text-center border w-70 b-secondary">Lecturer(s)</td>
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
                        class:cancelled-row={scheduleEntry.type === "cancellation"}
                        class:transition-before-row={scheduleEntry.type === "transition-before"}
                        class:transition-after-row={scheduleEntry.type === "transition-after"}
                        class:done-row={compareAsc(now, `${scheduleEntry.date} ${scheduleEntry.endTime}`) === 1}>
                        <td class="p-3 text-center border b-secondary">
                            <span> {scheduleEntry.date}<br /></span>
                            {scheduleEntry.startTime} - {scheduleEntry.endTime}
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
                                            if (!scheduleEntry.type) {
                                                scheduleId = scheduleEntry.id
                                                handleEditSchedule()
                                            } else {
                                                scheduleChangeId = scheduleEntry.scheduleChangeId
                                                handleEditScheduleChange()
                                            }
                                        }}
                                        class="py-2 px-5 rounded bg-alt"
                                        data-schedule-id={scheduleEntry.id}>Edit</button>
                                    <button
                                        on:click={() => {
                                            if (!scheduleEntry.type) {
                                                scheduleId = scheduleEntry.id
                                                showDelScheduleConfirm = true
                                            } else {
                                                scheduleChangeId = scheduleEntry.scheduleChangeId
                                                showDelScheduleChangeConfirm = true
                                            }
                                        }}
                                        disabled={isChangeDeletable(scheduleEntry)}
                                        class:cursor-not-allowed={isChangeDeletable(scheduleEntry)}
                                        class="py-2 px-3 rounded bg-alt">Delete</button>
                                </div>
                            </td>
                        {/if}
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
{:else if scheduleView === "card"}
    {#each $schedule[currentDay] as scheduleEntry}
        {@const lecturers = scheduleEntry.lecturer.split("/")}
        <div
            class="my-3 p-5 w-[90%] md:w-[90%] bg-alt border-right"
            class:cancelled-border={scheduleEntry.type === "cancellation"}
            class:transition-before-border={scheduleEntry.type === "transition-before"}
            class:transition-after-border={scheduleEntry.type === "transition-after"}
            class:done-border={compareAsc(now, `${scheduleEntry.date} ${scheduleEntry.endTime}`) === 1}>
            <div class="flex gap-3 items-center">
                <div class="i-lets-icons:date-fill w-1em h-1em"></div>
                <p>{scheduleEntry.date}</p>
            </div>
            <div class="flex gap-3 items-center">
                <div class="i-mingcute:time-fill w-1em h-1em"></div>
                <p>{scheduleEntry.startTime} - {scheduleEntry.endTime}</p>
            </div>
            <div class="flex gap-3 items-center">
                <div class="i-material-symbols-light:book w-1em h-1em"></div>
                <p>{scheduleEntry.course}</p>
            </div>
            <div class="flex gap-3 items-center">
                <div class="i-ic:baseline-room w-1em h-1em"></div>
                <p>{scheduleEntry.classroom}</p>
            </div>
            <div class="flex gap-3 items-center">
                <div class="i-fluent:people-12-filled w-1em h-1em"></div>

                <p>
                    {#each lecturers as lecturer}
                        <p>{lecturer}</p>
                    {/each}
                </p>
            </div>

            {#if $isLoggedIn}
                <div class="flex gap-3 mt-3">
                    <button
                        on:click={() => {
                            // if it is not a schedule change
                            if (!scheduleEntry.type) {
                                scheduleId = scheduleEntry.id
                                handleEditSchedule()
                            } else {
                                scheduleChangeId = scheduleEntry.scheduleChangeId
                                handleEditScheduleChange()
                            }
                        }}
                        class="py-2 px-5 rounded bg-primary"
                        data-schedule-id={scheduleEntry.id}>Edit</button>
                    <button
                        on:click={() => {
                            if (!scheduleEntry.type) {
                                scheduleId = scheduleEntry.id
                                showDelScheduleConfirm = true
                            } else {
                                scheduleChangeId = scheduleEntry.scheduleChangeId
                                showDelScheduleChangeConfirm = true
                            }
                        }}
                        class="py-2 px-3 rounded bg-primary">Delete</button>
                </div>
            {/if}
        </div>
    {/each}
{/if}

{#if $schedule[currentDay].length === 0}
    <p class="my-3 text-xl font-bold">No schedule.</p>
{/if}

<style>
    .transition-before-row {
        --at-apply: bg-yellow-300/13 !important;
    }

    .transition-after-row {
        --at-apply: bg-blue-300/10 !important;
    }

    .cancelled-row {
        --at-apply: bg-red-500/10 !important;
    }

    .done-row {
        --at-apply: bg-green-500/10;
    }

    .transition-before-border {
        --at-apply: border-r-12 border-yellow-300/13 !important;
    }

    .transition-after-border {
        --at-apply: border-r-12 border-blue-300/10 !important;
    }

    .cancelled-border {
        --at-apply: border-r-12 border-red-500/10 !important;
    }

    .done-border {
        --at-apply: border-r-12 border-green-500/10;
    }
</style>
