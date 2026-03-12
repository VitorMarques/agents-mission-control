import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

const query = queryGeneric;
const mutation = mutationGeneric;

const taskStatusValidator = v.union(
  v.literal("inbox"),
  v.literal("assigned"),
  v.literal("in_progress"),
  v.literal("review"),
  v.literal("blocked"),
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

export const getById = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.taskId);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    status: taskStatusValidator,
    assigneeIds: v.array(v.id("agents")),
    tags: v.optional(v.array(v.string())),
    parentTaskId: v.optional(v.id("tasks")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", {
      ...args,
      tags: args.tags ?? [],
      createdAt: Date.now(),
    });
  },
});

export const createSubtask = mutation({
  args: {
    parentTaskId: v.id("tasks"),
    title: v.string(),
    description: v.string(),
    assigneeIds: v.array(v.id("agents")),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      status: "assigned",
      assigneeIds: args.assigneeIds,
      parentTaskId: args.parentTaskId,
      tags: args.tags ?? ["delegated"],
      createdAt: Date.now(),
    });
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

export const markBlocked = mutation({
  args: {
    taskId: v.id("tasks"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, {
      status: "blocked",
      blockedReason: args.reason,
    });
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
