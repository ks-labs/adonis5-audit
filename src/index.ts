import { AuditEvents } from './contracts/AuditEvents'

import createAudit from './audit/createAudit'

import { Logger } from './debug'

import deleteWithAudit from './audit/deleteWithAudit'
import createOrUpdateWithAudit from './audit/createOrUpdateWithAudit'
import buildCurrentContext from './infraestructure/buildCurrentContext'
import { LucidModel } from '@ioc:Adonis/Lucid/Orm'
const isInsideSeed = process.argv.includes('db:seed')

// @ts-ignore
async function auditSave<T>(
  that: T & {
    superSave: () => Promise<T>
    superDelete: () => Promise<void>
  },
  params: any,
  auditModelUsed
): Promise<LucidModel | any> {
  Logger.debug('DISABLE ON SEED', isInsideSeed)
  if (isInsideSeed) return that.superSave()

  const auditCtx = buildCurrentContext(that, params, auditModelUsed)
  if (auditCtx) {
    return createOrUpdateWithAudit(that, auditCtx)
  }
  return that.superSave()
}

// @ts-ignore
async function auditDelete<T>(
  that: T & {
    superSave: () => Promise<T>
    superDelete: () => Promise<void>
  },
  params: any,
  auditModelUsed
): Promise<void> {
  Logger.debug('DISABLE ON SEED', isInsideSeed)
  if (isInsideSeed) return that.superDelete()

  const auditCtx = buildCurrentContext(that, params, auditModelUsed)
  if (auditCtx) {
    auditCtx.event = AuditEvents.DELETE
    return deleteWithAudit(that, auditCtx)
  }
  return that.superDelete()
}

export default { createAudit, auditDelete, auditSave }
