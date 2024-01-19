import { Hono } from "hono"
import { jwt } from "hono/jwt"
import { JWT_SECRET } from "../config/env"
import { getMyAccount, logOut } from "../controllers/auth"

// /api/auth
const authRouter = new Hono()
authRouter.use(
    "/*",
    jwt({
        secret: JWT_SECRET,
        cookie: "jwt",
    }),
)

authRouter.get("/@me", getMyAccount)

authRouter.post("/logout", logOut)

export default authRouter
