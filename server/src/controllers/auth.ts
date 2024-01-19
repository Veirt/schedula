import { Context } from "hono"
import { setCookie } from "hono/cookie"
import { Account } from "../models/Account"

export const getMyAccount = (c: Context) => {
    const payload = c.get("jwtPayload")

    const account = Account.getFirst({ id: payload.id })
    if (!account) {
        return c.json({ error: "Unauthorized" }, 401)
    }

    return c.json({ data: { account } })
}

export const logOut = (c: Context) => {
    setCookie(c, "jwt", "", { maxAge: 0 })

    return c.json({}, 204)
}
