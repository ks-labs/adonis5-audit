import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import AuditLib from '../src'

export default class Adonis5AuditProvider {
  public static needsApplication = true

  constructor(protected app: ApplicationContract) {}

  // Register your own bindings
  public async register(): Promise<void> {
    this.app.container.singleton('Adonis/Addons/Audit', () => {
      return AuditLib
    })
  }

  // IoC container is ready
  public async boot(): Promise<void> {}
  // App is ready
  public async ready() {}

  // Cleanup, since app is going down
  public async shutdown() {}
}
