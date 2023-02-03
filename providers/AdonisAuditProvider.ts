import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import createAudit from '../src/audit/createAudit'
import createAuditMixin from '../src/createAuditMixin'

export default class Adonis5AuditProvider {
  public static needsApplication = true

  constructor(protected app: ApplicationContract) {}

  // Register your own bindings
  public async register(): Promise<void> {
    this.app.container.bind('Adonis/Addons/AuditMixin', () => {
      return createAuditMixin({ app: this.app })
    })
  }

  // IoC container is ready
  public async boot(): Promise<void> {
    this.app.container.bind('Adonis/Addons/AuditHelpers', () => {
      return { createAudit }
    })
  }
  // App is ready
  public async ready() {}

  // Cleanup, since app is going down
  public async shutdown() {}
}
