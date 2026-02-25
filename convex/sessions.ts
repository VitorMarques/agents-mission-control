import { mutationGeneric, queryGeneric } from 'convex/server'
import { v } from 'convex/values'

const query = queryGeneric
const mutation = mutationGeneric

export const findByTokenHash = query({
  args: { tokenHash: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query('sessions').withIndex('by_token_hash', (q) => q.eq('tokenHash', args.tokenHash)).unique()
  },
})

export const create = mutation({
  args: {
    userId: v.id('users'),
    tokenHash: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('sessions', {
      ...args,
      createdAt: Date.now(),
    })
  },
})

export const deleteById = mutation({
  args: { sessionId: v.id('sessions') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.sessionId)
  },
})
