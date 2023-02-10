import buildAuditContext from './buildAuditContext'
import getLastArgument from '../helpers/getLastArgument'
import IAudit from '../contracts/IAudit'
/**
 * @param  {LucidModel} that - Current Model Instance Being Audited
 * @param  {Object} params - Current `.save()` or `.delete()` arguments with all params usually `[ 'variable1', { ctx } ]`
 * @param  {IAudit} auditClass - Your Audit Model Type
 */
export default function (that, params: any, auditClass: IAudit) {
  const auditOpts = getLastArgument(params)
  const auditCtx = buildAuditContext(that, auditClass, auditOpts)
  return auditCtx
}
