import { clone, omit } from 'lodash'
import AuditContext from '../contracts/AuditContext'
import createAudit from './createAudit'

export default async function (that, auditContext: AuditContext) {
  let oldData: any = clone(omit(that.$attributes))
  const newData = null
  // when deleted don't need new data field

  const result = await that.$superDelete()

  await createAudit({
    event: auditContext.event,
    auditable: auditContext.auditable,
    auditable_id: auditContext.auditable_id,
    request: auditContext?.ctx?.request,
    auth: auditContext?.ctx?.auth,
    ignoreDiff: that.$ignoreAuditFields,
    oldData,
    newData,
  })
  return result
}
