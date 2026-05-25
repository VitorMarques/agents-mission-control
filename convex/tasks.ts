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

const priorityValidator = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
  v.literal("critical"),
);

// ─── Queries ──────────────────────────────────────────────────────────

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").order("desc").collect();
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

export const listByAssignee = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const allTasks = await ctx.db.query("tasks").collect();
    return allTasks.filter((task) =>
      task.assigneeIds.some((id: any) => id === args.agentId),
    );
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();
    const now = Date.now();

    return {
      total: tasks.length,
      byStatus: {
        inbox: tasks.filter((t) => t.status === "inbox").length,
        assigned: tasks.filter((t) => t.status === "assigned").length,
        in_progress: tasks.filter((t) => t.status === "in_progress").length,
        review: tasks.filter((t) => t.status === "review").length,
        blocked: tasks.filter((t) => t.status === "blocked").length,
        done: tasks.filter((t) => t.status === "done").length,
      },
      byPriority: {
        low: tasks.filter((t) => t.priority === "low").length,
        medium: tasks.filter((t) => t.priority === "medium").length,
        high: tasks.filter((t) => t.priority === "high").length,
        critical: tasks.filter((t) => t.priority === "critical").length,
      },
      overdue: tasks.filter(
        (t) => t.dueDate && t.dueDate < now && t.status !== "done",
      ).length,
    };
  },
});

// ─── Mutations ────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    status: taskStatusValidator,
    priority: priorityValidator,
    assigneeIds: v.array(v.id("agents")),
    tags: v.optional(v.array(v.string())),
    parentTaskId: v.optional(v.id("tasks")),
    subscriberIds: v.optional(v.array(v.id("agents"))),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const taskId = await ctx.db.insert("tasks", {
      ...args,
      tags: args.tags ?? [],
      subscriberIds: args.subscriberIds ?? args.assigneeIds,
      createdAt: now,
      updatedAt: now,
    });

    // Log activity
    const agent = args.assigneeIds[0]
      ? await ctx.db.get(args.assigneeIds[0])
      : null;
    await ctx.db.insert("activities", {
      type: "task_created",
      agentId: args.assigneeIds[0],
      taskId,
      message: `Task "${args.title}" created${agent ? ` → assigned to ${agent.name}` : ""}`,
      createdAt: now,
    });

    return taskId;
  },
});

export const createSubtask = mutation({
  args: {
    parentTaskId: v.id("tasks"),
    title: v.string(),
    description: v.string(),
    priority: priorityValidator,
    assigneeIds: v.array(v.id("agents")),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      status: "assigned",
      priority: args.priority,
      assigneeIds: args.assigneeIds,
      parentTaskId: args.parentTaskId,
      tags: args.tags ?? ["delegated"],
      subscriberIds: args.assigneeIds,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const moveStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: taskStatusValidator,
    agentId: v.optional(v.id("agents")),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    const now = Date.now();
    const previousStatus = task.status;

    await ctx.db.patch(args.taskId, {
      status: args.status,
      updatedAt: now,
    });

    // Log activity
    const agent = args.agentId ? await ctx.db.get(args.agentId) : null;
    await ctx.db.insert("activities", {
      type: "status_changed",
      agentId: args.agentId,
      taskId: args.taskId,
      message: `"${task.title}" moved from ${previousStatus} → ${args.status}${agent ? ` by ${agent.name}` : ""}`,
      createdAt: now,
    });

    // Notify subscribers
    if (task.subscriberIds && task.subscriberIds.length > 0) {
      for (const subscriberId of task.subscriberIds) {
        if (subscriberId === args.agentId) continue; // Don't notify self
        await ctx.db.insert("notifications", {
          mentionedAgentId: subscriberId,
          content: `Task "${task.title}" moved to ${args.status}`,
          delivered: false,
          taskId: args.taskId,
          createdAt: now,
        });
      }
    }
  },
});

export const markBlocked = mutation({
  args: {
    taskId: v.id("tasks"),
    reason: v.string(),
    agentId: v.optional(v.id("agents")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.taskId, {
      status: "blocked",
      blockedReason: args.reason,
      updatedAt: now,
    });

    const task = await ctx.db.get(args.taskId);
    const agent = args.agentId ? await ctx.db.get(args.agentId) : null;

    await ctx.db.insert("activities", {
      type: "task_blocked",
      agentId: args.agentId,
      taskId: args.taskId,
      message: `"${task?.title}" blocked: ${args.reason}${agent ? ` by ${agent.name}` : ""}`,
      createdAt: now,
    });
  },
});

export const setAssignees = mutation({
  args: {
    taskId: v.id("tasks"),
    assigneeIds: v.array(v.id("agents")),
    agentId: v.optional(v.id("agents")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.taskId, {
      assigneeIds: args.assigneeIds,
      updatedAt: now,
    });

    const task = await ctx.db.get(args.taskId);
    const agents = await Promise.all(args.assigneeIds.map((id) => ctx.db.get(id)));
    const agentNames = agents.filter(Boolean).map((a) => a!.name).join(", ");

    await ctx.db.insert("activities", {
      type: "task_delegated",
      agentId: args.agentId,
      taskId: args.taskId,
      message: `"${task?.title}" reassigned to ${agentNames}`,
      createdAt: now,
    });
  },
});

export const updatePriority = mutation({
  args: {
    taskId: v.id("tasks"),
    priority: priorityValidator,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, {
      priority: args.priority,
      updatedAt: Date.now(),
    });
  },
});

export const subscribe = mutation({
  args: {
    taskId: v.id("tasks"),
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    const currentSubs = task.subscriberIds ?? [];
    if (!currentSubs.some((id: any) => id === args.agentId)) {
      await ctx.db.patch(args.taskId, {
        subscriberIds: [...currentSubs, args.agentId],
      });
    }
  },
});
