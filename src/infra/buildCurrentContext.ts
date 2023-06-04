import buildAuditContext from './buildAuditContext'
import getLastArgument from '../helpers/getLastArgument'

/**
 * @param  {LucidModel} that - Current Model Instance Being Audited
 * @param  {Object} params - Current `.save()` or `.delete()` arguments with all params usually `[ 'variable1', { ctx } ]`
 */
export default function (that, params: any) {
  const auditOpts = getLastArgument(params)
  const auditCtx = buildAuditContext(that, auditOpts)
  return auditCtx
}
