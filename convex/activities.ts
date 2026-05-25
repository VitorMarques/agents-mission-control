import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

const query = queryGeneric;
const mutation = mutationGeneric;

export const listByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activities")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("activities").order("desc").collect();
  },
});

export const create = mutation({
  args: {
    type: v.string(),
    agentId: v.optional(v.id("agents")),
    userId: v.optional(v.id("users")),
    taskId: v.optional(v.id("tasks")),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activities", {
      ...args,
      createdAt: Date.now(),
    });
  },
});
