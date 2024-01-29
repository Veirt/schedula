import { Context } from "hono"
import { setCookie } from "hono/cookie"
import db from "../db"

export const getMyAccount = async (c: Context) => {
    const payload = c.get("jwtPayload")

    const account = await db.query.accounts.findFirst({
        where: (accounts, { eq }) => eq(accounts.id, payload.id),
        columns: { id: true, name: true, avatar: true },
    })

    if (!account) {
        return c.json({ error: "Unauthorized" }, 401)
    }

    return c.json({ data: { account } })
}

export const logOut = (c: Context) => {
    setCookie(c, "jwt", "", { maxAge: 0 })

    return c.json({ sucess: true }, 200)
}
