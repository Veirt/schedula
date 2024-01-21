<script lang="ts">
    import { account, isLoggedIn } from "$lib/store/auth"
    import axios from "$lib/axios"
    import { onMount } from "svelte"

    onMount(async () => {
        const res = await axios.get("/api/auth/@me", {
            withCredentials: true,
            validateStatus: function (status) {
                return status < 500 // Resolve only if the status code is less than 500
            },
        })

        if (res.status === 200) {
            account.set(res.data.data.account)
            isLoggedIn.set(true)
            return
        }

        isLoggedIn.set(false)
    })
</script>

<slot />

<style lang="postcss">
    :global(body) {
        @apply bg-primary text-white;
    }
</style>
