<script lang="ts">
    export let showModal: boolean

    let dialog: HTMLDialogElement

    $: {
        if (dialog && showModal) dialog.showModal()
        if (dialog && showModal == false) dialog.close()
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog
    class="p-8 w-full text-white rounded backdrop:backdrop-blur-sm bg-primary md:w-3xl"
    bind:this={dialog}
    on:close={() => (showModal = false)}
    on:click|self={() => dialog.close()}>
    <div class="flex flex-row justify-between items-center border-b-2 b-secondary">
        <slot name="title" />
        <button on:click={() => dialog.close()} class="p-2"
            ><div class="i-material-symbols:close w-1em h-1em"></div></button>
    </div>
    <slot name="contents" />
</dialog>
