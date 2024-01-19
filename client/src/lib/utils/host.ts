import { dev } from "$app/environment"
import { PUBLIC_SERVER_URL } from "$env/static/public"

export function getHost(window: Window) {
    let host = PUBLIC_SERVER_URL || window.location.host
    if (dev) {
        host = `http://${window.location.hostname}:3000`
    }

    return host
}
