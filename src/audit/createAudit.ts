import { get, omit } from 'lodash'
import { RuntimeException } from 'node-exceptions'

/**
 * Run the audit
 *
 * @param {Object} auditData - audit payload
 * @param {'create'|'update'|'delete'} auditData.event - the currently audited event
 * @param {Object} auditData.oldData - the old data from audited schema
 * @param {Object} auditData.newData - the new data from audited schema
 * @param {string} auditData.auditable - the name of audited table
 * @param {number|string} auditData.auditableId - The id of audited table
 * @param {Object} options - Additional options of audit
 * @param {Object} options.auth - auth to extract `user_id`
 * @param {Object} options.request (required) - auth request to extract fields like `.ip()` and `.originalUrl()`
 * @param {Object} options.onlySave (required) - auth request to extract fields like `.ip()` and `.originalUrl()`
 * @param {Object} options.trackFields (required) - auth request to extract fields like `.ip()` and `.originalUrl()`
 * @returns {Promise<Audit>}
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
  AuditModel,
}) {
  if (!AuditModel) {
    throw new RuntimeException('Invalid audit model implementation ' + JSON.stringify(event))
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
  return await AuditModel.default.create({
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
