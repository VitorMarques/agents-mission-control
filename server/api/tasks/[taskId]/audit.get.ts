import { convexQuery } from '~~/server/utils/convexClient'
import { requireRole } from '~~/server/utils/requestAuth'
import type { UserRole } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireRole(event, ['ADMIN', 'MANAGER'] as UserRole[])

  const taskId = getRouterParam(event, 'taskId')
  if (!taskId) {
    throw createError({ statusCode: 400, statusMessage: 'taskId é obrigatório.' })
  }

  const logs = await convexQuery<any[]>('auditLogs:listByTask', { taskId })

  return {
    logs: logs
      .slice()
      .sort((a, b) => Number(b.createdAt ?? 0) - Number(a.createdAt ?? 0))
      .map((log) => ({
        id: String(log._id),
        action: String(log.action),
        userId: String(log.userId),
        before: log.before ? String(log.before) : null,
        after: log.after ? String(log.after) : null,
        source: String(log.source ?? ''),
        createdAt: Number(log.createdAt ?? 0),
      })),
  }
})
