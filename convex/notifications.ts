import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

const query = queryGeneric;
const mutation = mutationGeneric;

export const listByAgent = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_agent", (q) => q.eq("mentionedAgentId", args.agentId))
      .collect();
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("notifications").collect();
  },
});

export const listPendingByAgent = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_agent", (q) => q.eq("mentionedAgentId", args.agentId))
      .collect();

    return notifications.filter(
      (notification) => notification.delivered === false,
    );
  },
});

export const markDelivered = mutation({
  args: {
    notificationId: v.id("notifications"),
    delivered: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, { delivered: args.delivered });
  },
});
