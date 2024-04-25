import pluralize from 'pluralize'
import { snakeCase } from 'change-case'

export default function (userModel: any) {
  let userEntityName = Object.getPrototypeOf(userModel).constructor.name
  const userEntityNamePlural = pluralize.plural(userEntityName)
  const userEntityNamePluralSnackCase = snakeCase(userEntityNamePlural)
  return userEntityNamePluralSnackCase
}
