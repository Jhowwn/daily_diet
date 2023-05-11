// eslint-disable-next-line
import { knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    food: {
      id: string
      name: string
      description: string
      created_at: string
      is_healthy: boolean
      session_id?: string
    },
    user: {
      id: string
      name: string
      password: string
      created_at: string
    }
  }
}