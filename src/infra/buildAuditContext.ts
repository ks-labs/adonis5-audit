import { get, isNil, isObjectLike } from 'lodash'
import AuditContext from '../contracts/AuditContext'

export default function (that, argumentCfg: any): AuditContext | null {
  const HTTP_CONTEXT_PARAM = get(argumentCfg, 'ctx', null)
  const WITH_AUDIT_PARAM = get(argumentCfg, 'audit', null)
  // @ts-ignore will audit when [has model with audit flag] or [http context object param] or [ .audit with value on lat param ]
  let enableAudit = WITH_AUDIT_PARAM || HTTP_CONTEXT_PARAM || false

  if (isObjectLike(argumentCfg)) {
    if (!isNil(argumentCfg?.audit)) {
      enableAudit = argumentCfg?.audit
    }
  }
  if (enableAudit) {
    // eslint-disable-next-line eqeqeq
    const HAS_ENV_AUDIT_LOG = get(process.env, 'AUDIT_LOG', null) == 'true'
    // eslint-disable-next-line eqeqeq
    const HAS_DEBUG_ARGUMENT = get(argumentCfg, 'debug', null) == 'true'
    return {
      // shouldDebug? if has enabled AUDIT_LOG or has debug argument enabled
      debug: HAS_ENV_AUDIT_LOG || HAS_DEBUG_ARGUMENT || false,
      auditable_id: get(that, 'id', null),
      event: get(argumentCfg, 'event', null),
      auditable: Object.getPrototypeOf(that).constructor.name,
      ctx: HTTP_CONTEXT_PARAM,
    }
  }

  return null
}
