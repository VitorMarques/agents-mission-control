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

export const listByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("messages").collect();
  },
});

export const create = mutation({
  args: {
    taskId: v.id("tasks"),
    fromAgentId: v.id("agents"),
    content: v.string(),
    attachments: v.array(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const messageId = await ctx.db.insert("messages", {
      ...args,
      createdAt: now,
    });

    const mentionHandles = extractMentionHandles(args.content);
    if (mentionHandles.length === 0) {
      return messageId;
    }

    const agents = await ctx.db.query("agents").collect();
    const mentionedAgents = agents.filter((agent) =>
      mentionHandles.includes(agent.name.toLowerCase()),
    );

    for (const agent of mentionedAgents) {
      await ctx.db.insert("mentions", {
        taskId: args.taskId,
        messageId,
        mentionedAgentId: agent._id,
        createdAt: now,
      });

      await ctx.db.insert("notifications", {
        mentionedAgentId: agent._id,
        content: `Você foi mencionado em uma task por ${args.fromAgentId}`,
        delivered: false,
        taskId: args.taskId,
        createdAt: now,
      });
    }

    return messageId;
  },
});
