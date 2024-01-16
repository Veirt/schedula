<script lang="ts">
    import { days } from "$lib/utils/day"

    export let currentDay: number

    let displayWeekend = false
</script>

<div class="flex flex-wrap justify-center mt-5 md:flex-row">
    {#each days as day (day.index)}
        <button
            data-day-idx={day.index}
            on:click={() => (currentDay = day.index)}
            class:active={currentDay === day.index}
            class:weekend={!displayWeekend && (day.index === 0 || day.index === 6)}
            class="p-2 border cursor-pointer min-w-25 b-secondary">
            {day.name}
        </button>
    {/each}
</div>
<div class="my-3">
    <input id="display-weekend" bind:checked={displayWeekend} type="checkbox" />
    <label class="select-none" for="display-weekend">Display Weekend?</label>
</div>

<style lang="postcss">
    .active {
        @apply bg-secondary;
    }

    .weekend {
        @apply hidden;
    }
</style>
