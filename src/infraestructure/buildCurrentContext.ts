import buildAuditContext from './buildAuditContext'
import getLastArgument from '../helpers/getLastArgument'
import Audit from '../contracts/IAudit'
/**
 * @param  {LucidModel} that - Current Model Instance Being Audited
 * @param  {Object} params - Current `.save()` or `.delete()` arguments with all params usually `[ 'variable1', { ctx } ]`
 * @param  {Audit} AuditModel - Your Audit Model Type
 */

export default function (that, params: any, AuditModel: Audit) {
  const auditOpts = getLastArgument(params)
  const auditCtx = buildAuditContext(that, AuditModel, auditOpts)
  return auditCtx
}
