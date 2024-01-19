import db from "../db"

type AccountParams = {
    $id: string
    $name: string
    $avatar: string
    $access_token: string
    $refresh_token: string
}

type GetFirstAccountParams = Partial<AccountParams>

export class Account {
    id: string
    name: string
    avatar: string
    access_token: string
    refresh_token: string
    constructor(account: Account) {
        this.id = account.id
        this.name = account.name
        this.avatar = account.avatar
        this.access_token = account.access_token
        this.refresh_token = account.refresh_token
    }

    static init() {
        db.run(`
            CREATE TABLE IF NOT EXISTS accounts (
                id TEXT PRIMARY KEY,
                name TEXT,
                avatar TEXT,
                access_token TEXT,
                refresh_token TEXT
            )
        `)
    }

    insertOrUpdate() {
        db.run(
            `
            INSERT OR REPLACE INTO accounts (id, name, avatar, access_token, refresh_token)
            VALUES (?, ?, ?, ?, ?)
        `,
            [this.id, this.name, this.avatar, this.access_token, this.refresh_token],
        )
    }

    static getFirst({ id, name, avatar, access_token, refresh_token }: Partial<Account>) {
        const result = db
            .query<Account, Partial<GetFirstAccountParams>>(
                "SELECT * FROM accounts WHERE id = $id OR name = $name OR avatar = $avatar OR access_token = $access_token OR refresh_token = $refresh_token",
            )
            .get({
                $id: id!,
                $name: name!,
                $avatar: avatar!,
                $access_token: access_token!,
                $refresh_token: refresh_token!,
            })

        return result
    }
}
