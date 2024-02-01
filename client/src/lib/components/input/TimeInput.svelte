<script lang="ts">
    import dayjs from "dayjs"

    export let startTime: string | undefined
    export let endTime: string | undefined

    function getEndTime() {
        const timeRegex = new RegExp(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        if (startTime && startTime.match(timeRegex)) {
            const date = new Date(`2024-01-01 ${startTime}`)

            // add 1 hour 30 minutes
            const addedTime = dayjs(date).add(1, "hour").add(30, "minute")
            const resultTime = addedTime.format("HH:mm")
            endTime = resultTime
        }
    }
</script>

<div class="flex flex-row justify-between mt-3 w-full md:gap-5">
    <div class="flex flex-col w-[45%] md:w-1/2">
        <label for="time-start">Start</label>
        <input required on:change={getEndTime} bind:value={startTime} id="time-start" class="p-2 bg-alt" type="text" />
    </div>
    <div class="flex flex-col w-[45%] md:w-1/2">
        <label for="time-end">End</label>
        <input required bind:value={endTime} id="time-end" class="p-2 bg-alt" type="text" />
    </div>
</div>
