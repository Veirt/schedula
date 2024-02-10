<script lang="ts">
    import { days } from "$lib/utils/day"

    export let currentDay: number
    export let displayWeekend: boolean
</script>

<div class="flex flex-wrap justify-center mx-3 mt-5 md:flex-row">
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

<style lang="postcss">
    .active {
        @apply bg-secondary;
    }

    .weekend {
        @apply hidden;
    }
</style>
