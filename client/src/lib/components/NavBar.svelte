<script lang="ts">
    import { account, isLoggedIn } from "$lib/store/auth"
    import { PUBLIC_SERVER_URL } from "$env/static/public"
    import axios from "$lib/axios"

    export let showCreateModal: boolean
    export let showScheduleChangeModal: boolean

    let showDropdownMenu = false

    function getAvatar(id: string, avatarSrc: string) {
        const avatarUrl = `https://cdn.discordapp.com/avatars/${id}/${avatarSrc}.png`

        return avatarUrl
    }

    function handleDropdownFocusLoss(e: any) {
        const currentTarget = e.currentTarget as HTMLElement
        const clickedTarget = e.explicitOriginalTarget as HTMLElement

        if (currentTarget.contains(clickedTarget)) return
        showDropdownMenu = false
    }

    async function handleLogout() {
        await axios.post(`/api/auth/logout`, null)

        account.set({ id: "", username: "", avatar: "" })
        isLoggedIn.set(false)
        showDropdownMenu = false
    }
</script>

<nav class="flex flex-row justify-between items-center p-3 border-b border-alt min-h-20">
    <h1 class="font-bold">Schedula</h1>
    <div class="flex flex-row items-center">
        {#if $isLoggedIn === true}
            <button class="py-2 px-5 rounded bg-alt" on:click={() => (showCreateModal = true)}>Create</button>
            <button class="py-2 px-5 rounded bg-alt" on:click={() => (showScheduleChangeModal = true)}
                >Create Schedule Change</button>

            <div class="ml-3" on:focusout={handleDropdownFocusLoss}>
                <!-- svelte-ignore a11y-missing-attribute -->
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                <button on:click={() => (showDropdownMenu = !showDropdownMenu)}>
                    <!-- Avatar -->
                    <img class="w-12 rounded-full cursor-pointer" src={getAvatar($account.id, $account.avatar)} />
                </button>

                <ul
                    style:visibility={showDropdownMenu ? "visible" : "hidden"}
                    class="flex absolute right-10 top-20 flex-col gap-2 py-2 pl-3 rounded-md pr-15 bg-alt">
                    <li class="cursor-pointer">
                        <button on:click={handleLogout}> Log out </button>
                    </li>
                </ul>
            </div>
        {:else}
            <button class:invisible={$isLoggedIn == null} class="py-2 px-5 rounded bg-alt">
                <a href={`${PUBLIC_SERVER_URL ? PUBLIC_SERVER_URL : ""}/api/oauth/discord`}>Login</a>
            </button>
        {/if}
    </div>
</nav>
