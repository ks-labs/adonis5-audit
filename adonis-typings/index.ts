declare module '@ioc:Adonis/Addons/AuditMixin' {
  import { LucidModel, BaseModel } from '@ioc:Adonis/Lucid/Orm'
  import { ApplicationContract } from '@ioc:Adonis/Core/Application'

  type Constructor = new (...args: any[]) => any
  type NormalizeConstructor<T extends Constructor> = {
    new (...args: any[]): InstanceType<T>
  } & Omit<T, 'constructor'>

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

  export interface AuditMixin<T extends NormalizeConstructor<LucidModel>> {
    _originalSave: () => Promise<any>
    _originalDelete: () => Promise<void>
    ignoreAuditFields: string[]
    onlyFields: any[]
    save: (params: any) => Promise<T>
    delete: (params: any) => Promise<void>
  }
  export function createAudit(payload: AuditData): Promise<any>
  export default function <T extends NormalizeConstructor<LucidModel>>(superclass: T): T
}
