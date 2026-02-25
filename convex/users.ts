import { mutationGeneric, queryGeneric } from 'convex/server'
import { v } from 'convex/values'

const query = queryGeneric
const mutation = mutationGeneric

export const findByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query('users').withIndex('by_email', (q) => q.eq('email', args.email)).unique()
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal('ADMIN'), v.literal('MANAGER'), v.literal('VIEWER')),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('users', {
      ...args,
      isActive: true,
      createdAt: Date.now(),
    })
  },
})
