import { number, string, table } from '@rocicorp/zero'
import { mutations, serverWhere } from 'on-zero'

import type { TableInsertRow } from 'on-zero'

export type Follow = TableInsertRow<typeof schema>

export const schema = table('follow')
  .columns({
    id: string(),
    followerId: string(),
    followingId: string(),
    createdAt: number(),
  })
  .primaryKey('id')

const permissions = serverWhere('follow', (_, auth) => {
  return _.cmp('followerId', auth?.id || '')
})

export const mutate = mutations(schema, permissions)
