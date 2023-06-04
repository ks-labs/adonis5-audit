import { ApplicationContract } from '@ioc:Adonis/Core/Application'

/**
 * Provider to register audit mixin
 */
export default class AuditProvider {
  public static needsApplication = true

  constructor(protected app: ApplicationContract) {}

  // Register your own bindings
  public async register(): Promise<void> {
    this.app.container.singleton('Adonis/Addons/AuditMixin', () => {
      /** i that way without extension allow load the **.js after build process **/
      return require('../src/AuditPreload')
    })
  }

  // IoC container is ready
  public async boot(): Promise<void> {
    this.app.container.bind('Adonis/Addons/AuditHelpers', () => {
      const auditEvent = require('../src/audit/createAudit')
      return { auditEvent }
    })
  }
  // App is ready
  public async ready() {}

  // Cleanup, since app is going down
  public async shutdown() {}
}
