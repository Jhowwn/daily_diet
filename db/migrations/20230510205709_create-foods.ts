import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('foods', (table) => {
    table.uuid('id').primary()
    table.text('name').notNullable()
    table.text('description')
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
    table.boolean('is_healthy').notNullable()
    table.boolean('is_active').notNullable().defaultTo(true)
    table.uuid('session_id').after('id').index()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('foods')
}