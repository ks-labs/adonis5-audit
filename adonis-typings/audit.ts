/*
 * adonis5-audit
 *
 */

declare module '@ioc:Adonis/Addons/AuditMixin' {
  import type { LucidModel, LucidRow } from '@ioc:Adonis/Lucid/Orm'
  import type { NormalizeConstructor } from '@ioc:Adonis/Core/Helpers'
  import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

  export interface AuditMixin {
    <T extends NormalizeConstructor<LucidModel>>(superclass: T): T & {
      /**
       * Fields to be ignored on update check (ignored fields has removed before $auditFields)
       * fields written here will be ignored before you
       */
      $ignoreAuditFields: string[]

      /**
       * Fields to be audited always (ignored fields has removed before $auditFields)
       */
      $auditFields: string[]

      /**
       * Audit the model creation/update with User inferred passed through HttpContext
       */
      save<Model extends LucidModel & T>(params?: { ctx: HttpContextContract }): Promise<Model>

      /**
       * Audit the model delete with User inferred passed through HttpContext
       */
      delete(params?: { ctx: HttpContextContract }): Promise<void>
      new (...args: Array<any>): {
        /**
         * Override default save method
         */
        save(arguments: any): Promise<any>
        /**
         * Override default delete method
         */
        delete(aguments: any): Promise<void>
      }
    }
  }
  const Audit: AuditMixin

  export type AuditData = {
    /**
     * HttpContext that will provide user and ip address to audit entry
     *
     * @type {HttpContextContract}
     */
    ctx?: HttpContextContract
    /**
     * Name of custom event to be saved
     *
     * @type {('create' | 'save'| 'update' | string)}
     */
    event: string
    /**
     * Name of entity being audited this can be used to retrieve entity using along auditable_id
     *
     * @type {(string | null)}
     */
    auditable?: string | null
    auditable_id?: string | number | null
    oldData?: string
    newData?: string
    data?: any
  }
  const auditCustom: (payload: AuditData) => Promise<any>
  export { Audit, auditCustom }
}
