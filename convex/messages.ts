import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

const query = queryGeneric;
const mutation = mutationGeneric;

function extractMentionHandles(content: string) {
  return [
    ...new Set(
      (content.match(/@[a-zA-Z0-9_\-.]+/g) ?? []).map((value) =>
        value.slice(1).toLowerCase(),
      ),
    ),
  ];
}

// ─── Queries ──────────────────────────────────────────────────────────

export const listByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_task_created", (q) => q.eq("taskId", args.taskId))
      .order("asc")
      .collect();
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("messages").order("desc").collect();
  },
});

// ─── Mutations ────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    taskId: v.id("tasks"),
    fromAgentId: v.optional(v.id("agents")),
    fromUserId: v.optional(v.id("users")),
    content: v.string(),
    attachments: v.optional(v.array(v.id("documents"))),
    type: v.optional(
      v.union(
        v.literal("comment"),
        v.literal("decision"),
        v.literal("status_update"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const fromAgent = args.fromAgentId
      ? await ctx.db.get(args.fromAgentId)
      : null;
    const fromUser = args.fromUserId
      ? await ctx.db.get(args.fromUserId)
      : null;
    const task = await ctx.db.get(args.taskId);
    const authorName = fromAgent?.name ?? fromUser?.name ?? "System";

    const messageType = args.type ?? "comment";
    const messageId = await ctx.db.insert("messages", {
      taskId: args.taskId,
      fromAgentId: args.fromAgentId,
      fromUserId: args.fromUserId,
      content: args.content,
      attachments: args.attachments ?? [],
      type: messageType,
      createdAt: now,
    });

    // Extract @mentions
    const mentionHandles = extractMentionHandles(args.content);
    if (mentionHandles.length > 0) {
      const agents = await ctx.db.query("agents").collect();

      for (const handle of mentionHandles) {
        const mentionedAgent = agents.find(
          (agent) => agent.name.toLowerCase() === handle,
        );
        if (!mentionedAgent) continue;

        // Create mention record
        await ctx.db.insert("mentions", {
          taskId: args.taskId,
          messageId,
          mentionedAgentId: mentionedAgent._id,
          createdAt: now,
        });

        // Create notification
        await ctx.db.insert("notifications", {
          mentionedAgentId: mentionedAgent._id,
          content: `${authorName} mentioned you in "${task?.title}": ${args.content.slice(0, 100)}`,
          delivered: false,
          taskId: args.taskId,
          createdAt: now,
        });
      }
    }

    // Log activity
    const activityType =
      messageType === "decision" ? "decision" : "message_sent";
    await ctx.db.insert("activities", {
      type: activityType,
      agentId: args.fromAgentId,
      userId: args.fromUserId,
      taskId: args.taskId,
      message: `${authorName}: ${args.content.slice(0, 120)}`,
      createdAt: now,
    });

    return messageId;
  },
});
