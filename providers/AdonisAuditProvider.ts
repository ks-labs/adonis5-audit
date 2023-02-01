import { ApplicationContract } from '@ioc:Adonis/Core/Application'
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
}
