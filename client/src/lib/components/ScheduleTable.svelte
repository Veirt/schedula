<script lang="ts">
    type ScheduleEntry = {
        start: string
        end: string
        classroom: string
        course: string
        lecturer: string
    }

    export let currentDay: number
    export let schedule: ScheduleEntry[][]
</script>

<table class="mt-5 border b-secondary">
    <thead>
        <tr>
            <td class="p-3 border min-w-40 b-secondary">Time</td>
            <td class="p-3 border min-w-40 b-secondary">Classroom</td>
            <td class="p-3 border min-w-70 b-secondary">Course</td>
            <td class="p-3 border min-w-100 b-secondary">Lecturer(s)</td>
        </tr>
    </thead>
    <tbody>
        {#each schedule[currentDay] as scheduleEntry}
            <tr>
                <td class="p-3 border b-secondary">{scheduleEntry.start} - {scheduleEntry.end}</td>
                <td class="p-3 border b-secondary">{scheduleEntry.classroom}</td>
                <td class="p-3 border b-secondary">{scheduleEntry.course}</td>
                <td class="p-3 border b-secondary">{scheduleEntry.lecturer}</td>
            </tr>
        {/each}
    </tbody>
</table>
