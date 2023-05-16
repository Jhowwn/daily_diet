// eslint-disable-next-line
import { knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    foods: {
      id: string
      name: string
      description: string
      created_at: string
      is_healthy: boolean
      is_active: boolean
      session_id?: string
    },
    user: {
      session_id?: string
      name: string
      created_at: string
    }
  }
}