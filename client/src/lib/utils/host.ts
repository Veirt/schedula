import { dev } from "$app/environment"
import { PUBLIC_SERVER_URL } from "$env/static/public"

export function getApiUrl(window: Window) {
    let host = window.location.host
    if (dev) {
        host = `http://${window.location.hostname}:3000`
    } else {
        host = PUBLIC_SERVER_URL
    }

    return host
}
