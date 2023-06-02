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
       * Fields to be ignored always (fields to only use has priority over ignore)
       */
      ignoreAuditFields: string[]

      /**
       * Fields to be audited always (fields to only use has priority over ignore)
       */
      onlyFields: string[]

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
  export const Audit: AuditMixin
}
