import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

const query = queryGeneric;
const mutation = mutationGeneric;

const taskStatusValidator = v.union(
  v.literal("inbox"),
  v.literal("assigned"),
  v.literal("in_progress"),
  v.literal("review"),
  v.literal("done"),
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});

export const listByStatus = query({
  args: { status: taskStatusValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    status: taskStatusValidator,
    assigneeIds: v.array(v.id("agents")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", args);
  },
});

export const moveStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: taskStatusValidator,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, { status: args.status });
  },
});

export const setAssignees = mutation({
  args: {
    taskId: v.id("tasks"),
    assigneeIds: v.array(v.id("agents")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, { assigneeIds: args.assigneeIds });
  },
});
