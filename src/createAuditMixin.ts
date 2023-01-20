import { LucidModel } from '@ioc:Adonis/Lucid/Orm'
import { NormalizeConstructor } from '@ioc:Adonis/Core/Helpers'

import { AuditEvents } from './contracts/AuditEvents'
import deleteWithAudit from './audit/deleteWithAudit'
import createOrUpdateWithAudit from './audit/createOrUpdateWithAudit'
import buildContextObject from './infraestructure/buildCurrentContext'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'

/**
 * This trait is used to add the hability to notify a model using any channel
 */
export default function (app: ApplicationContract) {
  const AuditModel = app.container.use('App/Models/Audit')

  function AuditMixinGenerator<T extends NormalizeConstructor<LucidModel>>(superclass: T) {
    class AuditMixin extends superclass {
      // #region Implementation used by functions to call original behaviour
      public _originalSave() {
        return super.save()
      }
      public _originalDelete() {
        return super.delete()
      }
      // #endregion Implementation used by functions to call original behaviour

      // @ts-ignore
      public ignoreAuditFields = ['updated_at', 'updateAt']
      // @ts-ignore
      public onlyFields = []

      // @ts-ignore
      public async save(params: any): Promise<any> {
        const auditCtx = buildContextObject(this, arguments, AuditModel)
        if (auditCtx) {
          return createOrUpdateWithAudit(this, auditCtx)
        }
        return super.save()
      }

      // @ts-ignore
      public async delete(params: any): Promise<void> {
        const auditCtx = buildContextObject(this, arguments, AuditModel)
        if (auditCtx) {
          auditCtx.event = AuditEvents.DELETE
          return deleteWithAudit(this, auditCtx)
        }
        return super.delete()
      }
    }
    return AuditMixin
  }
  return AuditMixinGenerator
}
