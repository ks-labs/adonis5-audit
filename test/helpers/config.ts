import { resolve, join } from 'node:path'

import { Filesystem } from '@poppinss/dev-utils'

export const fs = new Filesystem(join(__dirname, 'app'))

const databaseConfig = {
  connection: 'sqlite',
  connections: {
    sqlite: {
      client: 'sqlite',
      connection: {
        filename: resolve(__dirname, './app/tmp/database.sqlite'),
      },
    },
  },
}

export async function createAppConfig() {
  await fs.add(
    'config/app.ts',
    `
export const appKey = 'anverylong32charsrandomsecretkey'
export const http = {
	cookie: {},
	trustProxy: () => true,
}
	`
  )
}

export async function createDatabaseConfig() {
  await fs.add(
    'config/database.ts',
    `
		const databaseConfig = ${JSON.stringify(databaseConfig, null, 2)}
		export default databaseConfig
	`
  )
}

export async function createAuditModelConfig() {
  await fs.add(
    'app/Models/Audit.ts',
    `
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

export default class Audit extends BaseModel {
	@column({ isPrimary: true })
	public id: number

	/** User Id */

	@column()
	public userId: number | null = null

	/** Entity Id */
	@column()
	public auditableId: string | null

	/** Entity Name */
	@column()
	public auditable: string | null

	/** Event Name */
	@column()
	public event: string

	/** IP from CTX */
	@column()
	public ip: string | null

	/** URL from CTX */
	@column()
	public url: string | null

	/** toJson() Data before*/
	@column()
	public oldData: any

	/** toJson() Data After*/
	@column()
	public newData: any

	@column.dateTime({ autoCreate: true })
	public createdAt: DateTime

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	public updatedAt: DateTime
}

`
  )
}
