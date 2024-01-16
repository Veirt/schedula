<script lang="ts">
    export let showModal: boolean

    let dialog: HTMLDialogElement

    $: if (dialog && showModal) dialog.showModal()
</script>

<dialog
    class="p-8 rounded text-white backdrop:backdrop-blur-sm bg-primary w-[90%] md:w-3xl"
    bind:this={dialog}
    on:close={() => (showModal = false)}>
    <div class="flex flex-row justify-between items-center border-b-2 b-secondary">
        <slot name="title" />
        <div class="p-2">x</div>
    </div>
    <slot name="contents" />
</dialog>
