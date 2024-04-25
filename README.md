# 🔖 Adonis5 Audit
[![test](https://github.com/ks-labs/adonis5-audit/actions/workflows/test.yml/badge.svg)](https://github.com/ks-labs/adonis5-audit/actions/workflows/test.yml)

Audit lucid models with Adonisjs V5 easily with a Mixin !!
After setup, everthing you need its call your models as following:

```js
public async store(ctx: HttpContextContract) {
  await currentMyModel.save({ ctx }) // need HttpContext for IP and auth.user
}
```

## Table of contents

- [🔖 Adonis5 Audit](#🔖-Adonis5-Audit)
  - [Installation](#Installation)
  - [How to Use](#how-to-use)
    - [Auditing models](#Auditing-models)
    - [Auditing Custom Events](#Auditing-Custom-Events)
  - [Sample Files](#Sample-files)
    - [Migration for Audit Table](#Migration)
    - [Model for Audit Creation](#Model)
  - [FAQ](#FAQ)
    - [Why not use ALS inside plugin ?](#Why-not-use-ALS-inside-plugin-?)

## Installation

1. Install the package:

   ```shell
   npm i adonis5-audit
   ```
2. Copy [`migration`](#Audit-Migration-File) file and register provider to your project with adonis command:

   ```shell
   node ace invoke adonis5-audit
   # or
   node ace configure adonis5-audit
   ```
3. Define your `Audit` model as the repo sample [`./templates/Audit.txt`](#Model)
   with Audit model you could embend some behavior that will be used during auditing operations.
4. Add it on your models importing and using with the composition as below:

```ts
// app/Models/MyModel
// you need this to extend your models
import { compose } from '@ioc:Adonis/Core/Helpers'
import { Audit } from '@ioc:Adonis/Addons/AuditMixin'
import { compose } from '@ioc:Adonis/Core/Helpers'


export default class MyModel extends compose(BaseModel, Audit) {
    // ... your custom model awesome implementation
}
```

## How to use

Audit your model from anywhere sending the "ctx" object with `HttpContext` since ALS don't works properly inside the mixin (see the section [Why not use ALS inside plugin ?](#Why-not-use-ALS-inside-plugin-?))

> You could use HttpContext.get() from ALS to get current request ctx and pass it explicitly to ensure that your request info its correctly

### Auditing models

```ts
export default class MyModelsController {

  public async store(ctx: HttpContextContract) {
    const { request } = ctx
    const currentMyModel = new MyModel()
    currentMyModel.cleanAndMerge(request.body()) // <= custom Code ehehe

    await currentMyModel.save({ ctx })
    // This will make an "create" audit since model was not saved before
    await currentMyModel.load('storehouse')
    return currentMyModel
  }

  public async update(ctx: HttpContextContract) {
    const { request } = ctx
    const currentMyModel = await MyModel.findOrFail(request.params().id)
    await currentMyModel.cleanAndMerge(request.body()) // <= custom Code ehehe

    await currentMyModel.save({ ctx })
    // This will make an "update" audit since Model allready Saved before save() call
    return currentMyModel
  }

  public async destroy(ctx: HttpContextContract) {
   const { request } = ctx // <= We need the ctx here because the lib use it to log IP Addresses, User and more !
   const myModelInstance = await MyModel.findOrFail(request.params().id)
   await myModelInstance.delete({ ctx })
   // this will make a "delete" audit when delete() call
   return myModelInstance
  }
}
```

### Auditing Custom Events

```ts
import { auditCustom } from '@ioc:Adonis/Addons/AuditMixin'
// we recommend define your app custom events
// in some centralized file as Enum
// this will ensure dont have event name change
import { CustomAuditEvents } from 'App/Types/AuditEvents'

// the following code will create your custom event .toString()


await auditCustom({
  ctx: httpContext, // current HttpContext to write user info
  event: "event-name", // custom event name
  auditable_id: 1, // audited entity id
  auditable: 'Manifest', // audited entity name
  data: vehicleTypeFound.toJSON(), // Object data to be audited at new_data field
})
```

## Sample Files

### Migration

```ts
import BaseSchema from '@ioc:Adonis/Lucid/Schema'
export default class Audits extends BaseSchema {
  protected tableName = 'audits'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // User id from ctx auth obj
      table.integer('user_id').unsigned().nullable()
      // User Model Name
      table.string('user_entity_name').defaultTo('users')
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

#### Model

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

## FAQ

### Why not use ALS inside plugin ?

Simple, it doesn't works with mixins !

The idea its do the following:

- Enable [`ALS (Async Local Storage)`](https://docs.adonisjs.com/guides/context#access-http-context-from-anywhere) with the config below, this will allow us get current context in request function call, with this the lib can get current `User`, `IP Address` and `Http Route` during audit.

  ## Enabling ALS

  To use ALS within your apps, you must enable it first inside the `/config/app.ts` file. Feel free to create the property manually if it doesn't exist.`/config/app.ts`:

  ```ts
  export const http: ServerConfig = {
    useAsyncLocalStorage: true,
  }
  ```

But it don't work with mixins since the `HttpContext.get()` by some reason lose the request reference making impossible return some context value. but yout still can use it from other app locations.



# How to commit in this repo ?

> ✨ feat(mixin): implement new mixin behaviour

This repo contain emojis for commits you can simply call `npm run cma` and it will stage everthing and ask for the emojis and description of commit.
