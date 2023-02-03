declare module '@ioc:Adonis/Addons/AuditHelpers' {
  export type AuditData = {
    event: string
    auth?: any
    request?: any
    auditable?: string
    ignoreDiff?: Array<string>
    auditable_id?: string
    url?: string
    ip?: string | null
    oldData?: string
    newData: string
    auditClass: any
  }
  function createAudit(payload: AuditData): Promise<any>
  export { createAudit }
}
