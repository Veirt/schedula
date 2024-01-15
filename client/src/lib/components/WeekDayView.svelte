<script lang="ts">
    export let currentDay: number

    const days = [
        { name: "Monday", index: 1 },
        { name: "Tuesday", index: 2 },
        { name: "Wednesday", index: 3 },
        { name: "Thursday", index: 4 },
        { name: "Friday", index: 5 },
        { name: "Saturday", index: 6 },
        { name: "Sunday", index: 0 },
    ]

    let displayWeekend = false
</script>

<div class="flex flex-row mt-5">
    {#each days as day (day.index)}
        <button
            data-day-idx={day.index}
            on:click={() => (currentDay = day.index)}
            class:active={currentDay === day.index}
            class:weekend={!displayWeekend && (day.index === 0 || day.index === 6)}
            class="p-2 border cursor-pointer min-w-25 b-secondary"
        >
            {day.name}
        </button>
    {/each}
</div>
<div class="my-3"><input bind:checked={displayWeekend} type="checkbox" /> Display Weekend?</div>

<style lang="postcss">
    .active {
        @apply bg-secondary;
    }

    .weekend {
        @apply hidden;
    }
</style>
