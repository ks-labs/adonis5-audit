import type { DatabaseContract } from '@ioc:Adonis/Lucid/Database'
import type { BaseModel as BaseModelContract, ColumnDecorator } from '@ioc:Adonis/Lucid/Orm'
import type { ApplicationContract } from '@ioc:Adonis/Core/Application'

import { test } from '@japa/runner'
import { compose } from '@poppinss/utils/build/helpers'

import { setupDatabase, cleanDatabase } from './helpers/database'
import { fs } from './helpers/config'
import { setupApp } from './helpers'

let db: DatabaseContract
let BaseModel: typeof BaseModelContract
let AuditMixin: <T>(superclass: T) => {} & T
let app: ApplicationContract
let column: ColumnDecorator
let AuditImpl: any

test.group('Auto preload', (group) => {
  group.setup(async () => {
    app = await setupApp()
    db = app.container.resolveBinding('Adonis/Lucid/Database')
    BaseModel = app.container.resolveBinding('Adonis/Lucid/Orm').BaseModel
    column = app.container.resolveBinding('Adonis/Lucid/Orm').column
    AuditMixin = app.container.resolveBinding('Adonis/Addons/AuditMixin').Audit
    app.container.bind('App/Models/Audit', async () => {
      class CustomAudit extends BaseModel {
        public static table = 'audits'
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
      }

      return CustomAudit
    })
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

  test('save must works properly', async ({ expect }) => {
    class User extends compose(BaseModel, AuditMixin) {
      @column({ isPrimary: true })
      public id: number

      @column()
      public email: string

      @column()
      public name: string
    }

    expect(User).toHaveProperty('$auditFields')
    expect(User).toHaveLength(0)

    /** ---------------------------------- CREATE AUDITION -------------------------------- */
    const userCreated = new User()
    userCreated.merge({ name: 'Nome', email: 'test' })
    /** @ts-ignore */
    await userCreated.save({
      ctx: {
        auth: {
          user: { id: 1 },
        },
        request: {
          url: () => '/api/v1/test',
          ip: () => '127.0.0.1',
        },
      },
    })
    expect(userCreated.$isPersisted).toBe(true)
    AuditImpl = await app.container.resolveBinding('App/Models/Audit')
    /** @ts-ignore */
    const auditRows = await AuditImpl.query().paginate(1, 100)
    expect(auditRows.rows).toHaveLength(1)
    expect(auditRows.rows[0]).not.toBeNull()
    // Always when has an creation event oldData must be null
    expect(auditRows.rows[0].oldData).toBe(null)
    expect(auditRows.rows[0].userId).toBe(1)
    expect(auditRows.rows[0].newData).toBe('{"name":"Nome","email":"test","id":1}')

    /** ---------------------------------- DELETE AUDITION -------------------------------- */
    /** @ts-ignore */
    await userCreated.delete({
      ctx: {
        auth: {
          user: { id: 2 },
        },
        request: {
          url: () => '/api/v1/test',
          ip: () => '127.0.0.1',
        },
      },
    })
    const auditsRowsDel = await AuditImpl.query().paginate(1, 100)
    expect(auditsRowsDel.rows).toHaveLength(2)
    expect(auditsRowsDel.rows[1]).not.toBeNull()
    expect(auditsRowsDel.rows[1].oldData).toBe('{"name":"Nome","email":"test","id":1}')
    expect(auditsRowsDel.rows[1].userId).toBe(2)
    // when deleted new data must be null
    expect(auditsRowsDel.rows[1].newData).toBe(null)
  })

  test('model extending from a custom base model and AuditMixin should have $ignoreAuditFields property empty', async ({
    expect,
  }) => {
    class CustomBaseModel extends BaseModel {}

    class User extends compose(CustomBaseModel, AuditMixin) {
      @column({ isPrimary: true })
      public id: number

      @column()
      public email: string

      @column()
      public name: string
    }

    expect(User).toHaveProperty('$ignoreAuditFields')
    expect(User['$ignoreAuditFields']).toHaveLength(0)
  })
})
