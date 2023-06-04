import { clone, omit, isEqual } from 'lodash'

import { AuditEvents } from '../contracts/AuditEvents'
import createAudit from './createAudit'
import doLogging from '../infra/doLogging'
import { only } from '../helpers/only'
import AuditContext from '../contracts/AuditContext'

export default async function (that, auditCfg: AuditContext) {
  let newData: any = clone(omit(that.$attributes))
  let oldData: any = clone(omit(that.$original))

  // if new and old are equal then don't bother updating
  const hasChanges = !isEqual(
    only(omit(oldData, that.$ignoreAuditFields), that.$auditFields), // old data without ignoreDiffCols
    only(omit(newData, that.$ignoreAuditFields), that.$auditFields) // new data without ignoreDiffCols
  )

  if (auditCfg.event === AuditEvents.CREATE) {
    oldData = null
  }
  const saveResult = await that.$superSave()

  if (hasChanges) {
    // save new id on create event to be accessible from audits listing
    if (auditCfg.event === AuditEvents.CREATE) {
      // @ts-ignore
      newData.id = that.id ?? null
      // @ts-ignore
      auditCfg.auditable_id = that.id ?? auditCfg.auditable_id
    }
    await createAudit({
      event: auditCfg.event,
      auditable: auditCfg.auditable,
      auditable_id: auditCfg.auditable_id,
      request: auditCfg?.ctx?.request,
      auth: auditCfg?.ctx?.auth,
      ignoreDiff: that.$ignoreAuditFields,
      oldData,
      newData,
    })
  }
  // save audit
  doLogging(auditCfg, oldData, newData, hasChanges)

  return saveResult
}
