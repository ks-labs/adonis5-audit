import type { DatabaseContract } from '@ioc:Adonis/Lucid/Database'

export async function createUsersTable(Database: DatabaseContract) {
  await Database.connection().schema.dropTableIfExists('users')
  await Database.connection().schema.createTable('users', (table) => {
    table.increments('id')
    table.string('email', 255).notNullable()
    table.string('name', 255).notNullable()
    table.timestamp('created_at', { useTz: true })
  })
}

export async function createAuditsTable(Database: DatabaseContract) {
  await Database.connection().schema.dropTableIfExists('audits')
  await Database.connection().schema.createTable('audits', (table) => {
    table.increments('id')
    // User id from Auth in ctx
    table
      .integer('user_id')
      .unsigned()
      .nullable()
      .defaultTo(null)
      .references('id')
      .inTable('users')
      .onDelete('SET NULL')
    // Entity Id
    table.string('auditable_id').nullable()
    // Entity Name
    table.string('auditable').nullable()
    // Event name saved
    table.string('event').nullable()
    // IP from ctx
    table.string('ip').nullable()
    // URL requested from ctx
    table.string('url').nullable()
    // Data Before
    table.json('old_data').nullable()
    // Data After
    table.json('new_data').nullable()
    table.timestamp('deleted_at', { useTz: true }).nullable().defaultTo(null)
    table.timestamps(true, true)
  })
}

export async function setupDatabase(Database: DatabaseContract) {
  await createUsersTable(Database)
  await createAuditsTable(Database)
}

export async function cleanDatabase(Database: DatabaseContract) {
  await Database.connection().dropAllTables()
  await Database.manager.closeAll()
}
