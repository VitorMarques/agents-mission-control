import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

const query = queryGeneric;
const mutation = mutationGeneric;

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agents").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    status: v.union(
      v.literal("idle"),
      v.literal("active"),
      v.literal("blocked"),
    ),
    sessionKey: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("agents", {
      ...args,
      currentTaskId: undefined,
    });
  },
});

export const setStatus = mutation({
  args: {
    agentId: v.id("agents"),
    status: v.union(
      v.literal("idle"),
      v.literal("active"),
      v.literal("blocked"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.agentId, { status: args.status });
  },
});

export const setCurrentTask = mutation({
  args: {
    agentId: v.id("agents"),
    taskId: v.optional(v.id("tasks")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.agentId, { currentTaskId: args.taskId });
  },
});
