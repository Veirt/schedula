<script lang="ts">
    export let currentDay: number

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
</script>

<div class="flex flex-row mt-5">
    {#each dayNames as day, idx (idx)}
        <button
            data-day-idx={idx}
            on:click={() => (currentDay = idx)}
            class:today={currentDay === idx}
            class="p-2 border cursor-pointer b-secondary"
        >
            {day}
        </button>
    {/each}
</div>

<style lang="postcss">
    .today {
        @apply bg-secondary;
    }
</style>
