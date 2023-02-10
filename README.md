## Table of contents

- [🔖 Adonis5 Audit](#-adonis5-audit)
  - [How to use](#how-to-use)
  - [Template Files](#template-files)
    - [Audit Migration File](#Audit-Migration-File)
    - [Audit Model Example](#Audit-Model-Example)

# 🔖 Adonis5 Audit

Audit lucid models with Adonisjs V5 easily with helper functions !!
After setup everthing you need call its `await myModel.save({ ctx })`

## How to use

1. Install the package `npm i adonis5-audit`
2. Copy migration file, add provider to your project [`node ace invoke adonis5-audit`](#Audit-Migration-File)
3. Define your Audit model like repo sample [`./templates/Audit.txt`](#Audit-Model-Example)
4. Add it on your models importing and using with the composition helper

   > Unfourtunely because some issues during development we cant make it works out of box as mixin, because during `db:seed` commands the typescript import causes some errors like saying that imported Audit model is a undefined type, so to avoid this we need import our models manualy to the lib we recommend create a "BaseModel" fo your project
   >

```ts
// you need this to extend your models
import { compose } from '@ioc:Adonis/Core/Helpers'
import { auditSave, auditDelete, createAudit } from '@ioc:Adonis/Addons/Audit'
class CRUDModel extends BaseModel {
// we need this to call the BaseModel original behaviour
// when dont have changes in code
  public superSave(): any {
    return super.save()
  }
  public superDelete(): any { // and this too
    return super.delete()
  }

  /** @ts-ignore */
  public async save(param?: { ctx }): Promise<this> {
	// you could use HttpContext.get() here !!
    const Audit = (await import('../Audit')).default // this type of import avoid weird behaviour
    return auditSave(this, arguments, Audit)
  }
  /** @ts-ignore */
  public async delete(param?: { ctx }): Promise<void> {
	// you could use HttpContext.get() here !!
    const Audit = (await import('App/Models/Audit')).default // this type of import avoid weird behaviour
    return auditSave(this, arguments, Audit)
  }

}


export default class MyAwesomeModel extends CRUDModel { // now all we need is inherit from CRUDModel in all our classes
    // ... your custom implementation
}
```

1. Audit your model from anywhere sending the HttpContext object !!
   _(you could try use `HttpContext.get() and enabling `useAsyncLocalStorage: true,`it on`app.ts`  to get current request context (but i prefer pass explicitly))_

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

## Oh we also have custom events support !!

```ts
import { createAudit } from '@ioc:Adonis/Addons/AuditHelpers'
// we recommend define your app custom events
// in some centralized file as Enum
// this will ensure dont have event name change
import { CustomAuditEvents } from 'App/Types/AuditEvents'

// the following code will create your custom event .toString()
await createAudit({
  auth: ctx.auth,
  request,
  event: 'CUSTOM_INTEGRATION', // this could be an String
  auditable_id: manifest.id,
  auditable: 'Manifest',
  newData: customData.toJSON(),
  auditType: Audit,
})
```

## Template Files

#### Audit Migration Example

```ts
import BaseSchema from '@ioc:Adonis/Lucid/Schema'
export default class Audits extends BaseSchema {
  protected tableName = 'audits'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // User id from ctx auth obj
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
      // URL request from ctx
      table.string('url').nullable()
      // Data Before
      table.json('old_data').nullable()
      // Data After
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

#### Audit Model Example

```ts
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

import User from './User'

export default class Audit extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number | null = null
  /** User Id */
  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  public user: BelongsTo<typeof User>

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
```
