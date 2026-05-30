import type { PoolClient } from 'pg'

const sql = `
ALTER TABLE "prediction" ADD COLUMN "finalHomeScore" integer;
ALTER TABLE "prediction" ADD COLUMN "finalAwayScore" integer;
`

export async function up(client: PoolClient) {
  await client.query(sql)
}
