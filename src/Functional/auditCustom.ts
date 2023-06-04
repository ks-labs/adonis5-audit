import createAudit from './createAudit'

/**
 * Run the audit
 *
 * @param {Object} param0 - audit payload
 * @param {'create'|'update'|'delete'|string} param0.event - the currently audited event
 * @param {Object} param0.oldData - the oldData from audited schema
 * @param {Object} param0.newData - override by newData field
 * @param {Object} param0.data - override by data field
 * @param {string} param0.auditable - the name of entity being audited
 * @param {number|string} param0.auditable_id - The id of audited table
 * @returns {Promise<Audit>}
 */
export default async function ({
  ctx,
  auditable = null,
  auditable_id = null,
  event = null,
  oldData = null,
  newData = null,
  data = null,
}) {
  await createAudit({
    event: event,
    auditable: auditable,
    auditable_id: auditable_id,
    request: ctx?.request,
    auth: ctx?.auth,
    ignoreDiff: [],
    oldData: oldData,
    newData: newData ?? data,
  })
}
