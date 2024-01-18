<script lang="ts">
    export let showCreateModal: boolean

    let showDropdownMenu = false

    const handleDropdownFocusLoss = (e: any) => {
        const currentTarget = e.currentTarget as HTMLElement
        const clickedTarget = e.explicitOriginalTarget as HTMLElement

        if (clickedTarget.parentNode === currentTarget) return
        showDropdownMenu = false
    }
</script>

<nav class="flex flex-row justify-between items-center p-3 border-b border-alt">
    <h1 class="font-bold">Schedula</h1>
    <div class="flex flex-row items-center">
        <button class="py-2 px-5 rounded bg-alt" on:click={() => (showCreateModal = true)}>Create</button>

        <div class="ml-3" on:focusout={handleDropdownFocusLoss}>
            <!-- svelte-ignore a11y-missing-attribute -->
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
            <button on:click={() => (showDropdownMenu = !showDropdownMenu)}>
                <!-- Avatar -->
                <img class="w-12 rounded-full cursor-pointer" src="" />
            </button>

            <ul
                style:visibility={showDropdownMenu ? "visible" : "hidden"}
                class="flex absolute right-10 top-20 flex-col gap-2 py-2 pl-3 rounded-md pr-15 bg-alt">
                <li class="cursor-pointer">Log out</li>
            </ul>
        </div>
    </div>
</nav>
