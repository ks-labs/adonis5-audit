import IAudit from '../contracts/IAudit'

type AuditContext = {
  auditable: string | any
  auditable_id: number | any
  debug: boolean | any
  event: string | any
  ctx: any
  auditClass: IAudit
}
export default AuditContext
