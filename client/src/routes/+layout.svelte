<script lang="ts">
    import { account, isLoggedIn } from "$lib/store/auth"
    import { getHost } from "$lib/utils/host"
    import axios from "axios"
    import { onMount } from "svelte"

    onMount(async () => {
        const res = await axios.get("/api/auth/@me", {
            baseURL: getHost(window),
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

<body class="text-white bg-primary">
    <slot />
</body>
