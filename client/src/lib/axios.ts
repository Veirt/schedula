import { PUBLIC_SERVER_URL } from "$env/static/public"
import axios from "axios"

export default axios.create({
    withCredentials: true,
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": "true",
    },
    baseURL: PUBLIC_SERVER_URL,
})
