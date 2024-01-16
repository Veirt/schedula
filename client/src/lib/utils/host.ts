import { dev } from "$app/environment"

export function getHost(window: Window) {
    let host = window.location.host
    if (dev) {
        host = `http://${window.location.hostname}:3000`
    }

    return host
}
