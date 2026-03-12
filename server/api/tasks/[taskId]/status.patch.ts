import { convexMutation } from '~~/server/utils/convexClient'
import { requirePermission } from '~~/server/utils/requestAuth'

const allowedStatuses = ['inbox', 'assigned', 'in_progress', 'review', 'done'] as const

type TaskStatus = (typeof allowedStatuses)[number]

export default defineEventHandler(async (event) => {
  requirePermission(event, 'task:status:move')

  const taskId = getRouterParam(event, 'taskId')
  if (!taskId) {
    throw createError({ statusCode: 400, statusMessage: 'taskId é obrigatório.' })
  }

  const body = await readBody<{ status?: TaskStatus }>(event)
  if (!body.status || !allowedStatuses.includes(body.status)) {
    throw createError({ statusCode: 400, statusMessage: 'Status inválido.' })
  }

  await convexMutation('tasks:moveStatus', {
    taskId,
    status: body.status,
  })

  return { ok: true }
})
