import type { ApplicationContract } from '@ioc:Adonis/Core/Application'

import path from 'path'

import { Application } from '@adonisjs/application'

import { fs, createAppConfig, createDatabaseConfig } from './config'

export async function setupApp(): Promise<ApplicationContract> {
  await fs.add('.env', '')
  await fs.add('./tmp/database.sqlite', '')
  await createAppConfig()
  await createDatabaseConfig()
  // await createAuditModel()

  const app = new Application(fs.basePath, 'test', {
    providers: [
      '@adonisjs/core',
      '@adonisjs/lucid',
      path.join(__dirname, '../../providers/AdonisAuditProvider'),
    ],
    aliases: {
      App: 'app',
      Config: 'config',
      Database: 'database',
      Contracts: 'contracts',
    },
  })

  await app.setup()
  await app.registerProviders()
  await app.bootProviders()

  return app
}
