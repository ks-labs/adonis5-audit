import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import buildCurrentContext from '../infra/buildCurrentContext'

import { NormalizeConstructor } from '@ioc:Adonis/Core/Helpers'
import { LucidModel } from '@ioc:Adonis/Lucid/Orm'
import auditCreateOrUpdate from '../Functional/auditCreateOrUpdate'
import deleteWithAudit from '../Functional/deleteWithAudit'
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
      const auditCtx = buildCurrentContext(this, arguments)
      if (auditCtx) {
        auditCtx.event = AuditEvents.DELETE
        return deleteWithAudit(this, auditCtx)
      }
      await super.delete()
    }

    /** @ts-ignore */
    public async save(params?: { ctx: HttpContextContract }): Promise<this> {
      const auditCtx = buildCurrentContext(this, arguments)
      if (auditCtx) {
        return auditCreateOrUpdate(this, auditCtx)
      }
      await super.save()
      return this
    }
  }

  return AuditModel
}
