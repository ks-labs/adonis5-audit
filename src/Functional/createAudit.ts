import { get, omit } from 'lodash'
import { RuntimeException } from 'node-exceptions'
import resolveAuditModel from '../helpers/resolveAuditModel'

/**
 * Run the audit
 *
 */
export default async function ({
  auth,
  request,
  auditable,
  ignoreDiff = [],
  auditable_id = null,
  event = null,
  url = null,
  ip = null,
  oldData = null,
  newData = null,
}) {
  const auditClass = await resolveAuditModel()

  if (!auditClass) {
    throw new RuntimeException('Invalid audit model supplied ' + JSON.stringify(event))
  }
  if (!event) {
    throw new RuntimeException('Invalid audit event provided ' + JSON.stringify(event))
  }
  // check request was passed
  if (request) {
    url = request?.url() ?? null
    ip = request?.ip() ?? null
  }

  // get user data to store
  const userId = get(auth, 'user.id', null)
  // save audit
  return await auditClass.create({
    userId,
    auditableId: auditable_id,
    auditable,
    event,
    url,
    ip,
    oldData: oldData ? omit(oldData, ignoreDiff) : null,
    newData: newData ? omit(newData, ignoreDiff) : null,
  })
}