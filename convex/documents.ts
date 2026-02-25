import { mutationGeneric, queryGeneric } from 'convex/server'
import { v } from 'convex/values'

const query = queryGeneric
const mutation = mutationGeneric

export const listByTask = query({
  args: { taskId: v.id('tasks') },
  handler: async (ctx, args) => {
    return await ctx.db.query('documents').withIndex('by_task', (q) => q.eq('taskId', args.taskId)).collect()
  },
})

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    type: v.string(),
    taskId: v.id('tasks'),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    return await ctx.db.insert('documents', {
      ...args,
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const update = mutation({
  args: {
    documentId: v.id('documents'),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.documentId, {
      title: args.title,
      content: args.content,
      type: args.type,
      updatedAt: Date.now(),
    })
  },
})
