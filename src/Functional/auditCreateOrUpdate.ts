import { AuditEvents } from '../contracts/AuditEvents'
import AuditContext from '../contracts/AuditContext'
import isCreateAudit from '../helpers/isCreateAudit'
import isUpdateAudit from '../helpers/isUpdateAudit'
import saveWithAudit from './saveChangesWithAudit'

export default function auditCreateOrUpdate(that, auditCfg: AuditContext) {
  if (isCreateAudit(that)) {
    auditCfg.event = AuditEvents.CREATE
    return saveWithAudit(that, auditCfg)
  } else if (isUpdateAudit(that)) {
    auditCfg.event = AuditEvents.UPDATE
    return saveWithAudit(that, auditCfg)
  }
  return that
}
