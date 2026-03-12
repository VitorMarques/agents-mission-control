import { convexMutation, convexQuery } from '~~/server/utils/convexClient'
import { requirePermission } from '~~/server/utils/requestAuth'

const allowedStatuses = ['inbox', 'assigned', 'in_progress', 'review', 'done'] as const

type TaskStatus = (typeof allowedStatuses)[number]

export default defineEventHandler(async (event) => {
  const authUser = requirePermission(event, 'task:status:move')

  const taskId = getRouterParam(event, 'taskId')
  if (!taskId) {
    throw createError({ statusCode: 400, statusMessage: 'taskId é obrigatório.' })
  }

  const body = await readBody<{ status?: TaskStatus }>(event)
  if (!body.status || !allowedStatuses.includes(body.status)) {
    throw createError({ statusCode: 400, statusMessage: 'Status inválido.' })
  }

  const currentTask = await convexQuery<any>('tasks:getById', { taskId })
  if (!currentTask) {
    throw createError({ statusCode: 404, statusMessage: 'Task não encontrada.' })
  }

  await convexMutation('tasks:moveStatus', {
    taskId,
    status: body.status,
  })

  await convexMutation('auditLogs:create', {
    action: 'task.status.changed',
    userId: authUser._id,
    taskId,
    before: String(currentTask.status ?? ''),
    after: body.status,
    source: 'api/tasks/[taskId]/status.patch',
  })

  return { ok: true }
})
