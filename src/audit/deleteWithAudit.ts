import { clone, omit } from 'lodash'
import AuditContext from '../contracts/AuditContext'
import createAudit from './createAudit'

export default async function (that, auditCfg: AuditContext) {
  let currentData: any = clone(omit(that.$attributes))
  const result = await that._originalDelete()
  await createAudit({
    event: auditCfg.event,
    auditable: auditCfg.auditable,
    auditable_id: auditCfg.auditable_id,
    request: auditCfg?.ctx?.request,
    auth: auditCfg?.ctx?.auth,
    ignoreDiff: that.ignoreAuditFields,
    oldData: currentData,
    newData: null,
    auditClass: auditCfg.auditClass,
  })
  return result
}
