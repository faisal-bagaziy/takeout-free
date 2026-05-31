import { ANYONE_CAN, createSchema, definePermissions } from '@rocicorp/zero'

import * as tables from './generated/tables'
import { allRelationships } from './relationships'

const allTables = Object.values(tables)

export const schema = createSchema({
  tables: allTables,
  relationships: allRelationships,
  enableLegacyQueries: false,
})

export const permissions = definePermissions<{}, typeof schema>(schema, () => ({
  match: { row: { select: ANYONE_CAN } },
  prediction: { row: { select: ANYONE_CAN } },
  leaderboardEntry: { row: { select: ANYONE_CAN } },
  userPublic: { row: { select: ANYONE_CAN } },
  userState: { row: { select: ANYONE_CAN } },
  follow: { row: { select: ANYONE_CAN } },
  todo: { row: { select: ANYONE_CAN } },
}))
