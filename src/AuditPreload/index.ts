import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { NormalizeConstructor } from '@ioc:Adonis/Core/Helpers'
import { LucidModel } from '@ioc:Adonis/Lucid/Orm'

export function Audit<T extends NormalizeConstructor<LucidModel>>(superclass: T) {
  class AuditModel extends superclass {
    public static ignoreAuditFields: string[] = []
    public static onlyFields: string[] = []

    // public static boot() {
    //   if (this.booted) {
    //     return
    //   }

    //   super.boot()
    // }
    public async delete(params?: { ctx: HttpContextContract }): Promise<void> {
      console.warn('DELETED AUDIT', params)
      await super.delete()
      /**@ts-ignore */
      return this
    }

    public async save(params?: { ctx: HttpContextContract }): Promise<this> {
      console.warn('DELETED AUDIT', params)
      await super.save()
      return this
    }
  }

  return AuditModel
}
