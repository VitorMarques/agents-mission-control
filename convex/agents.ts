import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

const query = queryGeneric;
const mutation = mutationGeneric;

// ─── Queries ──────────────────────────────────────────────────────────

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agents").collect();
  },
});

export const getById = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.agentId);
  },
});

export const getBySessionKey = query({
  args: { sessionKey: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_session_key", (q) => q.eq("sessionKey", args.sessionKey))
      .first();
  },
});

export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("idle"),
      v.literal("active"),
      v.literal("blocked"),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

// ─── Mutations ────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    avatarEmoji: v.optional(v.string()),
    status: v.union(
      v.literal("idle"),
      v.literal("active"),
      v.literal("blocked"),
    ),
    sessionKey: v.string(),
    capabilities: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("agents", {
      ...args,
      avatarEmoji: args.avatarEmoji ?? "🤖",
      capabilities: args.capabilities ?? [],
      currentTaskId: undefined,
      lastHeartbeatAt: undefined,
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
    await ctx.db.patch(args.agentId, {
      status: args.status,
      lastHeartbeatAt: Date.now(),
    });

    // Log activity
    const agent = await ctx.db.get(args.agentId);
    if (agent) {
      await ctx.db.insert("activities", {
        type: "agent_status_changed",
        agentId: args.agentId,
        message: `${agent.name} status changed to ${args.status}`,
        createdAt: Date.now(),
      });
    }
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

export const heartbeat = mutation({
  args: {
    agentId: v.id("agents"),
    currentTaskId: v.optional(v.id("tasks")),
    status: v.optional(
      v.union(
        v.literal("idle"),
        v.literal("active"),
        v.literal("blocked"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, any> = {
      lastHeartbeatAt: Date.now(),
    };
    if (args.currentTaskId !== undefined) {
      patch.currentTaskId = args.currentTaskId;
    }
    if (args.status) {
      patch.status = args.status;
    }
    await ctx.db.patch(args.agentId, patch);
  },
});

export const updateCapabilities = mutation({
  args: {
    agentId: v.id("agents"),
    capabilities: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.agentId, { capabilities: args.capabilities });
  },
});

// ─── Seed ─────────────────────────────────────────────────────────────

export const seedAgents = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("agents").collect();
    if (existing.length > 0) {
      return { seeded: false, reason: "Agents already exist" };
    }

    const agents = [
      {
        name: "Hades",
        role: "Technical Specialist & Engineer",
        avatarEmoji: "⚡",
        status: "idle" as const,
        sessionKey: "hades",
        capabilities: [
          "coding",
          "architecture",
          "security",
          "devops",
          "code-review",
        ],
      },
      {
        name: "Poseidon",
        role: "Strategy & Product Lead",
        avatarEmoji: "🌊",
        status: "idle" as const,
        sessionKey: "poseidon",
        capabilities: [
          "strategy",
          "product",
          "planning",
          "coordination",
          "review",
        ],
      },
      {
        name: "Minerva",
        role: "Research & Knowledge Manager",
        avatarEmoji: "🦉",
        status: "idle" as const,
        sessionKey: "minerva",
        capabilities: [
          "research",
          "documentation",
          "knowledge-base",
          "analysis",
          "writing",
        ],
      },
      {
        name: "Apollo",
        role: "SEO & Analytics Analyst",
        avatarEmoji: "🔭",
        status: "idle" as const,
        sessionKey: "apollo",
        capabilities: [
          "seo",
          "analytics",
          "audit",
          "performance",
          "search-console",
        ],
      },
    ];

    const ids = [];
    for (const agent of agents) {
      const id = await ctx.db.insert("agents", {
        ...agent,
        currentTaskId: undefined,
        lastHeartbeatAt: undefined,
      });
      ids.push(id);

      await ctx.db.insert("activities", {
        type: "agent_created",
        agentId: id,
        message: `${agent.name} (${agent.role}) joined the squad`,
        createdAt: Date.now(),
      });
    }

    return { seeded: true, agentIds: ids };
  },
});
