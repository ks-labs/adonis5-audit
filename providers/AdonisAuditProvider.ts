import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import createAuditMixin from '../src/createAuditMixin'

export default class Adonis5AuditProvider {
  public static needsApplication = true

  constructor(protected app: ApplicationContract) {}

  // Register your own bindings
  public async register(): Promise<void> {
    this.app.container.bind('Adonis/Addons/AuditMixin', () => createAuditMixin(this.app))
  }

  // IoC container is ready
  public async boot(): Promise<void> {}
  public async ready() {
    // App is ready
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}
