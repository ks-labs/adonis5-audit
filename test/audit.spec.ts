import type { DatabaseContract } from '@ioc:Adonis/Lucid/Database'

import type {
  BaseModel as BaseModelContract,
  ColumnDecorator,
  DateColumnDecorator,
} from '@ioc:Adonis/Lucid/Orm'
import type { ApplicationContract } from '@ioc:Adonis/Core/Application'

import { test } from '@japa/runner'

import { setupDatabase, cleanDatabase } from './helpers/database'
import { fs } from './helpers/config'
import { setupApp } from './helpers'

import type * as AuditLib from '@ioc:Adonis/Addons/Audit'
import { DateTime } from 'luxon'

let db: DatabaseContract
let BaseModel: typeof BaseModelContract
let AuditAddons: typeof AuditLib
let app: ApplicationContract
let column: ColumnDecorator
let columnDateTime: DateColumnDecorator
let UserModel: any
let AuditModel: any

function fakeCTX(user: any, ip: any, url: any) {
  return {
    request: {
      ip: () => ip ?? '127.0.0.1',
      url: () => url ?? '/endpoints',
    },
    auth: {
      user: user ?? { id: 1 },
    },
  }
}

test.group('Audit Addons Functions', (group) => {
  group.setup(async () => {
    app = await setupApp()
    db = app.container.resolveBinding('Adonis/Lucid/Database')
    BaseModel = app.container.resolveBinding('Adonis/Lucid/Orm').BaseModel
    column = app.container.resolveBinding('Adonis/Lucid/Orm').column
    columnDateTime = app.container.resolveBinding('Adonis/Lucid/Orm').column.dateTime
    AuditAddons = app.container.resolveBinding('Adonis/Addons/Audit')

    class Audit extends BaseModel {
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

      @columnDateTime({ autoCreate: true })
      public createdAt: DateTime

      @columnDateTime({ autoCreate: true, autoUpdate: true })
      public updatedAt: DateTime
    }
    class User extends BaseModel {
      @column({ isPrimary: true })
      public id: number

      @column()
      public email: string

      @column()
      public name: string

      public superSave() {
        return super.save()
      }

      public superDelete() {
        return super.delete()
      }

      /** @ts-ignore */
      public async save(param?: { ctx }): Promise<this> {
        return AuditAddons.auditSave(this, arguments, Audit)
      }
      /** @ts-ignore */
      public async delete(param?: { ctx }): Promise<void> {
        return AuditAddons.auditDelete(this, arguments, Audit)
      }
    }
    User.boot()
    Audit.boot()

    UserModel = User
    AuditModel = Audit
  })

  group.each.setup(async () => {
    await setupDatabase(db)
  })

  group.each.teardown(async () => {
    await cleanDatabase(db)
  })

  group.teardown(async () => {
    await db.manager.closeAll()
    await fs.cleanup()
  })

  test('Test real world audit lifecycle', async ({ expect }) => {
    let allAudits: any[]
    const userModel = new UserModel()
    userModel.merge({
      email: 'test@email.com',
      name: 'UserName',
    })
    // ---------- AUDIT CREATE

    await userModel.save({ ctx: fakeCTX(null, null, '/create-route') })
    allAudits = await AuditModel.all()
    expect(allAudits).toHaveLength(1)
    const firstAuditEntry = allAudits[0]

    expect(firstAuditEntry).not.toBeNull()
    expect(firstAuditEntry).not.toBeUndefined()
    expect(firstAuditEntry.auditableId).toContainEqual(userModel.id.toString())
    expect(firstAuditEntry.userId).toEqual(1)
    expect(firstAuditEntry.auditable).toEqual('User')
    expect(firstAuditEntry.event).toEqual('create')
    const createdPayload = JSON.stringify(userModel) // use stringify instead toJSON() because toJSON() doesn't escape the \"
    expect(firstAuditEntry.oldData).toEqual(null)
    expect(firstAuditEntry.newData).toEqual(createdPayload)
    // ---------- AUDIT UPDATE
    userModel.merge({
      email: 'test@email.com',
      name: 'UserNameChanged',
    })
    await userModel.save({
      ctx: fakeCTX(null, null, '/update-route'),
    })
    allAudits = await AuditModel.query().orderBy('id', 'desc')
    expect(allAudits).toHaveLength(2)
    const updatedPayload = JSON.stringify(userModel) // use stringify instead toJSON() because toJSON() doesn't escape the \"
    const lastUpdateAudit = allAudits[0]

    expect(lastUpdateAudit.event).toEqual('update')
    expect(lastUpdateAudit.auditable).toEqual('User')
    expect(lastUpdateAudit.userId).toEqual(1)
    expect(lastUpdateAudit.oldData).toEqual(createdPayload)
    expect(lastUpdateAudit.newData).toEqual(updatedPayload)
    // --------- AUDIT DELETE
    await userModel.delete({ ctx: fakeCTX(null, null, '/delete-route') })
    allAudits = await AuditModel.query().orderBy('id', 'desc')
    expect(allAudits).toHaveLength(3)
    const lastDeleteAudit = allAudits[0]

    expect(lastDeleteAudit.event).toEqual('delete')
    expect(lastDeleteAudit.auditable).toEqual('User')
    expect(lastDeleteAudit.userId).toEqual(1)
    expect(lastDeleteAudit.ip).toEqual('127.0.0.1')
    expect(lastDeleteAudit.url).toEqual('/delete-route')
    expect(lastDeleteAudit.oldData).toEqual(updatedPayload)
    expect(lastDeleteAudit.newData).toEqual(null)
  })
})
