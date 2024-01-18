import db from "../db"

export type AccountType = {
    id: string
    name: string
    avatar: string
    access_token: string
    refresh_token: string
}

export class Account {
    id: string
    name: string
    avatar: string
    private access_token: string
    private refresh_token: string
    constructor(account: AccountType) {
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

    static getFirst({ id, name, avatar, access_token, refresh_token }: Partial<AccountType>) {
        const result = db
            .query(
                "SELECT * FROM accounts WHERE id = ? OR name = ? OR avatar = ? OR access_token = ? OR refresh_token = ?",
            )
            .get(id!, name!, avatar!, access_token!, refresh_token!)

        return result
    }
}
