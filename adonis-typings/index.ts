declare module '@ioc:Adonis/Addons/AuditMixin' {
  import { LucidModel } from '@ioc:Adonis/Lucid/Orm'
  import { ApplicationContract } from '@ioc:Adonis/Core/Application'

  type Constructor = new (...args: any[]) => any
  type NormalizeConstructor<T extends Constructor> = {
    new (...args: any[]): InstanceType<T>
  }

  const BaseModel: LucidModel
  interface AuditMixin extends LucidModel {
    ignoreAuditFields: string[]
    onlyFields: any[]
    save: (params: any | { ctx }) => Promise<this>
    delete: (params: any | { ctx }) => Promise<void>
  }

  const AuditClass: AuditMixin

  export default function <T extends NormalizeConstructor<typeof BaseModel>>(
    superclass: T
  ): typeof AuditClass

  type AuditData = {
    auth: any
    request: any
    auditable: string | null
    ignoreDiff: Array<string> | null
    auditable_id: string
    event: string
    url: string
    ip: string
    oldData: string
    newData: string
    AuditModel: LucidModel
  }
  export function createAudit(payload: AuditData): Promise<any>
}
