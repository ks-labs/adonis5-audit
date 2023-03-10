declare module '@ioc:Adonis/Addons/Audit' {
  import { BaseModel } from '@ioc:Adonis/Lucid/Orm'

  import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

  export function auditSave<T>(
    that: T,
    funcParams: any & [{ ctx }],
    auditModel: typeof BaseModel
  ): Promise<T> & Promise<void>

  export function auditDelete<T>(
    that: T,
    funcParams: any & [{ ctx }],
    auditModel: typeof BaseModel
  ): Promise<
    T & {
      ignoreAuditFields: string[]
      onlyFields: string[]
      save: (params: { ctx: HttpContextContract }) => Promise<T>
      delete: (params: { ctx: HttpContextContract }) => Promise<void>
      superSave: () => Promise<T>
      superDelete: () => Promise<void>
    }
  > &
    Promise<void>

  export type AuditData = {
    event: string
    auth?: any
    request?: any
    auditable?: string
    ignoreDiff?: string[]
    auditable_id?: string
    url?: string
    ip?: string | null
    oldData?: string
    newData?: string
    auditClass: typeof BaseModel
  }
  export function createAudit(payload: AuditData): Promise<any>
}
