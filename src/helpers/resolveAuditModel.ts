import { LucidModel } from '@ioc:Adonis/Lucid/Orm'
import { isNil } from 'lodash'
import { RuntimeException } from 'node-exceptions'

export default async function (): Promise<LucidModel | any> {
  const Audit = (await global[Symbol.for('ioc.use')]('App/Models/Audit')) as LucidModel
  if (isNil(Audit)) {
    throw new RuntimeException(
      '`Audit` model not declared or initialized by adonisjs app, please declare it or create a new App/Models/Audit',
      500,
      'MODEL_NOT_FOUND_EXCEPTION'
    )
  }
  return Audit
}
