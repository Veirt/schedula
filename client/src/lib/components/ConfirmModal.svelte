<script lang="ts">
    import Modal from "./Modal.svelte"
    import { createEventDispatcher } from "svelte"

    const dispatch = createEventDispatcher()

    export let showConfirmModal: boolean
</script>

<Modal bind:showModal={showConfirmModal}>
    <h2 class="text-xl" slot="title">Delete Confirmation</h2>

    <div slot="contents">
        <p class="text-lg"><slot /></p>
        <div class="flex flex-row gap-3 my-3">
            <button on:click={() => dispatch("deleteConfirmed")} class="py-2 px-3 bg-red-600 rounded">Delete</button>
            <button on:click={() => (showConfirmModal = false)} class="py-2 px-3 rounded bg-alt">Cancel</button>
        </div>
    </div>
</Modal>
