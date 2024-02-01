<script lang="ts">
    export let value: string | number | undefined
    export let name: string
    export let id: string
    export let required: boolean
</script>

<label class="my-3 capitalize" for={id}>{name}</label>
<input {required} bind:value class="p-2 bg-alt" {id} type="text" />
