<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of contents

- [🔖 Adonis5 Audit](#-adonis5-audit)
  - [How to use](#how-to-use)
  - [Template Files](#template-files)
      - [Audit Migration](#audit-migration)
      - [Audit Model](#audit-model)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# 🔖 Adonis5 Audit

Audit lucid models with Adonisjs V5 !

## How to use

1. Install the package `npm i @ksgl/adonis5-audit`

2. Copy migration file, add provider to your project `node ace invoke @ksgl/adonis5-audit`

3. Define Audit Model like one in folder `templates/Audit.txt`

4. Add it on your models importing and using with the composition helper
 ```ts
 // @ts-ignore
 import { compose } from '@ioc:Adonis/Core/Helpers'
 import AuditMixin from '@ioc:Adonis/Addons/AuditMixin'

 export default class MyAwesomeModel extends compose(BaseModel, AuditMixin) { ... }
 ```

5. Call it from anythere
```ts
export default class MyModelsController {

  public async store(ctx: HttpContextContract) {
    const { request } = ctx
    const currentMyModel = new MyModel()
    currentMyModel.cleanAndMerge(request.body()) // <= custom Code ehehe

    await currentMyModel.save({ ctx }) // <= This will make an CREATE event entry on audits table since model was not saved before
    await currentMyModel.load('storehouse')
    return currentMyModel
  }

  public async update(ctx: HttpContextContract) {
    const { request } = ctx
    const currentMyModel = await MyModel.findOrFail(request.params().id)
    await currentMyModel.cleanAndMerge(request.body()) // <= custom Code ehehe

    await currentMyModel.save({ ctx }) // <= This will make an UPDATE event entry on audits table
    return currentMyModel
  }

  public async destroy(ctx: HttpContextContract) {
   const { request } = ctx // <= We need the ctx here because the lib use it to log IP Addresses, User and more !
   const myModelInstance = await MyModel.findOrFail(request.params().id)
   await myModelInstance.delete({ ctx }) // <- this will make an DELETE event entry on audits table
   return myModelInstance
  }
}
```

## Template Files

#### Audit Migration

```ts
import BaseSchema from '@ioc:Adonis/Lucid/Schema'
export default class Audits extends BaseSchema {
  protected tableName = 'audits'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // Usuário
      table
        .integer('user_id')
        .unsigned()
        .nullable()
        .defaultTo(null)
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      // Nome
      table.string('auditable_id').nullable()
      // Auditável
      table.string('auditable').nullable()
      // Nome do Evento
      table.string('event').nullable()
      // IP
      table.string('ip').nullable()
      // text
      table.string('url').nullable()
      // Antes
      table.json('old_data').nullable()
      // Depois
      table.json('new_data').nullable()

      table.timestamp('deleted_at', { useTz: true }).nullable().defaultTo(null)
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

#### Audit Model

```ts
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

import User from './User'

export default class Audit extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  /** Usuário */

  @column()
  public userId: number | null = null
  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  public user: BelongsTo<typeof User>

  /** Nome */
  @column()
  public auditableId: string | null

  /** Auditável */
  @column()
  public auditable: string | null

  /** Nome do Evento */
  @column()
  public event: string

  /** IP */
  @column()
  public ip: string | null

  /** text */
  @column()
  public url: string | null

  /** Antes */
  @column()
  public oldData: any

  /** Depois */
  @column()
  public newData: any

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
```
