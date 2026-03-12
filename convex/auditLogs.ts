import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

const query = queryGeneric;
const mutation = mutationGeneric;

export const create = mutation({
  args: {
    action: v.string(),
    userId: v.id("users"),
    taskId: v.optional(v.id("tasks")),
    before: v.optional(v.string()),
    after: v.optional(v.string()),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("auditLogs", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const listByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("auditLogs")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();
  },
});
