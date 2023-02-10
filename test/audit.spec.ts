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

test.group('Auto preload', (group) => {
  group.setup(async () => {
    app = await setupApp()
    db = app.container.resolveBinding('Adonis/Lucid/Database')
    BaseModel = app.container.resolveBinding('Adonis/Lucid/Orm').BaseModel
    column = app.container.resolveBinding('Adonis/Lucid/Orm').column
    AuditMixin = app.container.resolveBinding('Adonis/Addons/AuditMixin')
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
    class User extends BaseModel {
      @column({ isPrimary: true })
      public id: number

      @column()
      public email: string

      @column()
      public name: string
    }

    expect(User).toHaveProperty('$with')
    expect(User).toHaveLength(0)
  })

  test('filling $with with type other than string or function should throw an exception', async ({
    expect,
  }) => {
    expect(() => {
      class User extends BaseModel {
        public static $with = [1]

        @column({ isPrimary: true })
        public id: number

        @column()
        public email: string

        @column()
        public name: string
      }

      User.boot()
    }).toThrowError(
      'The model "User" has wrong relationships to be auto-preloaded. Only string and function types are allowed'
    )
  })

  test('model extending from a custom base model and AutoPreload mixin should have $with property', async ({
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

    expect(User).toHaveProperty('$with')
  })
})
