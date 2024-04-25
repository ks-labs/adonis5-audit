import { get, isNil, omit } from 'lodash'
import { RuntimeException } from 'node-exceptions'
import resolveAuditModel from '../helpers/resolveAuditModel'
import getUserEntityName from '../helpers/getUserEntityName'

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
  let auditClass = await resolveAuditModel()
  if (!isNil(auditClass?.default)) {
    auditClass = auditClass.default
  }
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
  // @ts-ignore
  return await auditClass.create({
    userId,
    userEntityName: getUserEntityName(auth.user),
    auditableId: auditable_id,
    auditable,
    event,
    url,
    ip,
    oldData: oldData ? omit(oldData, ignoreDiff) : null,
    newData: newData ? omit(newData, ignoreDiff) : null,
  })
}
