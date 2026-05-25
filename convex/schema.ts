import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ─── Auth ──────────────────────────────────────────────────────────
  users: defineTable({
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    role: v.union(
      v.literal("ADMIN"),
      v.literal("MANAGER"),
      v.literal("VIEWER"),
    ),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  sessions: defineTable({
    userId: v.id("users"),
    tokenHash: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_token_hash", ["tokenHash"])
    .index("by_expires_at", ["expiresAt"]),

  // ─── Agents ────────────────────────────────────────────────────────
  agents: defineTable({
    name: v.string(),
    role: v.string(),
    avatarEmoji: v.optional(v.string()),
    status: v.union(
      v.literal("idle"),
      v.literal("active"),
      v.literal("blocked"),
    ),
    currentTaskId: v.optional(v.id("tasks")),
    sessionKey: v.string(),
    lastHeartbeatAt: v.optional(v.number()),
    capabilities: v.optional(v.array(v.string())),
  })
    .index("by_status", ["status"])
    .index("by_session_key", ["sessionKey"]),

  // ─── Tasks ─────────────────────────────────────────────────────────
  tasks: defineTable({
    title: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("inbox"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("blocked"),
      v.literal("done"),
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical"),
    ),
    assigneeIds: v.array(v.id("agents")),
    parentTaskId: v.optional(v.id("tasks")),
    blockedReason: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    subscriberIds: v.optional(v.array(v.id("agents"))),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    dueDate: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_created_at", ["createdAt"]),

  // ─── Messages (thread comments) ────────────────────────────────────
  messages: defineTable({
    taskId: v.id("tasks"),
    fromAgentId: v.optional(v.id("agents")),
    fromUserId: v.optional(v.id("users")),
    content: v.string(),
    attachments: v.array(v.id("documents")),
    type: v.union(
      v.literal("comment"),
      v.literal("decision"),
      v.literal("status_update"),
    ),
    createdAt: v.optional(v.number()),
  })
    .index("by_task", ["taskId"])
    .index("by_task_created", ["taskId", "createdAt"]),

  // ─── Mentions (extracted from @mentions in messages) ────────────────
  mentions: defineTable({
    taskId: v.id("tasks"),
    messageId: v.id("messages"),
    mentionedAgentId: v.id("agents"),
    createdAt: v.optional(v.number()),
  })
    .index("by_agent", ["mentionedAgentId"])
    .index("by_task", ["taskId"]),

  // ─── Activities (global feed) ──────────────────────────────────────
  activities: defineTable({
    type: v.string(),
    agentId: v.optional(v.id("agents")),
    userId: v.optional(v.id("users")),
    taskId: v.optional(v.id("tasks")),
    message: v.string(),
    createdAt: v.optional(v.number()),
  })
    .index("by_task", ["taskId"])
    .index("by_created_at", ["createdAt"])
    .index("by_type", ["type"]),

  // ─── Documents ─────────────────────────────────────────────────────
  documents: defineTable({
    title: v.string(),
    content: v.string(),
    type: v.union(
      v.literal("deliverable"),
      v.literal("research"),
      v.literal("protocol"),
      v.literal("report"),
      v.literal("audit"),
    ),
    taskId: v.optional(v.id("tasks")),
    agentId: v.optional(v.id("agents")),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_task", ["taskId"])
    .index("by_agent", ["agentId"])
    .index("by_type", ["type"]),

  // ─── Notifications ─────────────────────────────────────────────────
  notifications: defineTable({
    mentionedAgentId: v.id("agents"),
    content: v.string(),
    delivered: v.boolean(),
    taskId: v.optional(v.id("tasks")),
    createdAt: v.optional(v.number()),
  })
    .index("by_agent", ["mentionedAgentId"])
    .index("by_agent_delivered", ["mentionedAgentId", "delivered"]),

  // ─── Audit Logs ────────────────────────────────────────────────────
  auditLogs: defineTable({
    action: v.string(),
    userId: v.id("users"),
    taskId: v.optional(v.id("tasks")),
    before: v.optional(v.string()),
    after: v.optional(v.string()),
    source: v.string(),
    createdAt: v.number(),
  })
    .index("by_task", ["taskId"])
    .index("by_user", ["userId"])
    .index("by_created_at", ["createdAt"]),
});
