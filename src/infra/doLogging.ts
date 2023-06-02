import { has, omit } from 'lodash'

import AuditContext from '../contracts/AuditContext'
import { Logger } from '../debug'

export default function doLogging(
  auditCfg: AuditContext,
  oldData: any,
  newData: any,
  hasChanges: any
) {
  if (auditCfg.debug) {
    Logger.debug('audit: ' + hasChanges ? 'changed:' : 'no-changed:')
    /** @ts-ignore */
    Logger.debug('oldData: %O', omit(oldData, ['createdAt', 'updatedAt']))
    /** @ts-ignore */
    Logger.debug('newData: %O', omit(newData, ['createdAt', 'updatedAt']))
    if (!has(auditCfg, 'ctx.request.ip') || !has(auditCfg, 'ctx.auth.user.id')) {
      Logger.error('audit:warn request.ip or auth.user.id not present on HttpContext ctx object')
    }
  }
}
