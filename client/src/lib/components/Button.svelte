<script lang="ts">
    import Loading from "$lib/components/Loading.svelte"

    export let loading = false
    export let type: "button" | "submit" | "reset" | null | undefined
    export let disabled = false
</script>

<button class="flex justify-center items-center p-2 px-4 w-28 capitalize rounded bg-alt" {type} {disabled}>
    {#if loading}
        <Loading />
    {/if}
    <slot />
</button>
