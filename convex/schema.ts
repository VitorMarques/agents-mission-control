import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
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
  })
    .index("by_status", ["status"])
    .index("by_session_key", ["sessionKey"]),

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
    assigneeIds: v.array(v.id("agents")),
    parentTaskId: v.optional(v.id("tasks")),
    blockedReason: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    createdAt: v.optional(v.number()),
  }).index("by_status", ["status"]),

  messages: defineTable({
    taskId: v.id("tasks"),
    fromAgentId: v.id("agents"),
    content: v.string(),
    attachments: v.array(v.id("documents")),
    createdAt: v.optional(v.number()),
  }).index("by_task", ["taskId"]),

  mentions: defineTable({
    taskId: v.id("tasks"),
    messageId: v.id("messages"),
    mentionedAgentId: v.id("agents"),
    createdAt: v.optional(v.number()),
  })
    .index("by_agent", ["mentionedAgentId"])
    .index("by_task", ["taskId"]),

  activities: defineTable({
    type: v.string(),
    agentId: v.id("agents"),
    taskId: v.optional(v.id("tasks")),
    message: v.string(),
    createdAt: v.optional(v.number()),
  })
    .index("by_task", ["taskId"])
    .index("by_created_at", ["createdAt"]),

  documents: defineTable({
    title: v.string(),
    content: v.string(),
    type: v.string(),
    taskId: v.id("tasks"),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("by_task", ["taskId"]),

  notifications: defineTable({
    mentionedAgentId: v.id("agents"),
    content: v.string(),
    delivered: v.boolean(),
    taskId: v.optional(v.id("tasks")),
    createdAt: v.optional(v.number()),
  })
    .index("by_agent", ["mentionedAgentId"])
    .index("by_agent_delivered", ["mentionedAgentId", "delivered"]),

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
