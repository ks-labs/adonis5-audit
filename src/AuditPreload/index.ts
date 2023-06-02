import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import buildCurrentContext from '../infra/buildCurrentContext'

import { NormalizeConstructor } from '@ioc:Adonis/Core/Helpers'
import { LucidModel } from '@ioc:Adonis/Lucid/Orm'
import createOrUpdateWithAudit from '../audit/createOrUpdateWithAudit'
import deleteWithAudit from '../audit/deleteWithAudit'
import { AuditEvents } from '../contracts/AuditEvents'

export function Audit<T extends NormalizeConstructor<LucidModel>>(superclass: T) {
  class AuditModel extends superclass {
    public static $ignoreAuditFields: string[] = []
    public static $auditFields: string[] = []

    public $superSave(): any {
      return super.save()
    }
    public $superDelete(): any {
      return super.delete()
    }

    public static boot() {
      if (this.booted) {
        return
      }

      super.boot()
    }

    /** @ts-ignore */
    public async delete(params?: { ctx: HttpContextContract }): Promise<void> {
      const AuditType = (await global[Symbol.for('ioc.use')]('App/Models/Audit')) as LucidModel
      const auditCtx = buildCurrentContext(this, arguments, AuditType)
      if (auditCtx) {
        auditCtx.event = AuditEvents.DELETE
        return deleteWithAudit(this, auditCtx)
      }
      await super.delete()
    }

    /** @ts-ignore */
    public async save(params?: { ctx: HttpContextContract }): Promise<this> {
      /** Load entity directly from the project app/models/Audit.ts allowing user customize class behavior  */
      const AuditType = (await global[Symbol.for('ioc.use')]('App/Models/Audit')) as LucidModel
      const auditCtx = buildCurrentContext(this, arguments, AuditType)
      if (auditCtx) {
        return createOrUpdateWithAudit(this, auditCtx)
      }
      await super.save()
      return this
    }
  }

  return AuditModel
}
