declare module '@ioc:Adonis/Addons/AuditMixin' {
  import { LucidModel } from '@ioc:Adonis/Lucid/Orm'

  import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

  type Constructor = new (...args: any[]) => any
  type NormalizeConstructor<T extends Constructor> = {
    new (...args: any[]): InstanceType<T>
  }

  export interface AuditMixinClass extends LucidModel {
    ignoreAuditFields: string[]
    onlyFields: string[]
    save: (params: { ctx: HttpContextContract }) => Promise<this>
    delete: (params: { ctx: HttpContextContract }) => Promise<void>
  }
  /**
   * This trait is used to add the hability to notify a model using any channel
   */
  const AuditMixin: <T extends NormalizeConstructor<LucidModel>>(
    superclass: T
  ) => {
    new (...args: any[]): InstanceType<T> & AuditMixinClass
  } & T
  export default AuditMixin
}
