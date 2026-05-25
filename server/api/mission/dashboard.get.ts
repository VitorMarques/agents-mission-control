import { convexQuery } from "~~/server/utils/convexClient";
import { requireAuthUser } from "~~/server/utils/requestAuth";

type TaskStatus =
  | "inbox"
  | "assigned"
  | "in_progress"
  | "review"
  | "blocked"
  | "done";

type TaskPriority = "low" | "medium" | "high" | "critical";

type DashboardPayload = {
  agents: Array<{
    id: string;
    name: string;
    role: string;
    avatarEmoji: string;
    status: "idle" | "active" | "blocked";
    currentTaskId: string | null;
    lastHeartbeatAt: number | null;
    capabilities: string[];
  }>;
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    assigneeIds: string[];
    tags: string[];
    labels: string[];
    createdAt: number;
    updatedAt: number;
    parentTaskId?: string;
    blockedReason?: string;
    subscriberIds: string[];
    dueDate?: number;
  }>;
  feed: Array<{
    id: string;
    type: string;
    author: string;
    agentId?: string;
    taskId?: string;
    summary: string;
    timestampLabel: string;
  }>;
  columns: Array<{ status: TaskStatus; label: string }>;
  messagesByTask: Record<string, Array<Record<string, any>>>;
  activitiesByTask: Record<string, Array<Record<string, any>>>;
  documentsByTask: Record<string, Array<Record<string, any>>>;
  notificationsByTask: Record<string, Array<Record<string, any>>>;
};

const COLUMNS: DashboardPayload["columns"] = [
  { status: "inbox", label: "Inbox" },
  { status: "assigned", label: "Assigned" },
  { status: "in_progress", label: "In Progress" },
  { status: "review", label: "Review" },
  { status: "blocked", label: "Blocked" },
  { status: "done", label: "Done" },
];

function toTimestampLabel(createdAt?: number) {
  if (!createdAt) return "agora";
  const minutes = Math.max(1, Math.floor((Date.now() - createdAt) / 60000));
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `há ${days}d`;
}

function normalizeTaskStatus(value: string): TaskStatus {
  const valid: TaskStatus[] = [
    "inbox",
    "assigned",
    "in_progress",
    "review",
    "blocked",
    "done",
  ];
  return valid.includes(value as TaskStatus) ? (value as TaskStatus) : "inbox";
}

function normalizePriority(value: string): TaskPriority {
  const valid: TaskPriority[] = ["low", "medium", "high", "critical"];
  return valid.includes(value as TaskPriority)
    ? (value as TaskPriority)
    : "medium";
}

function groupByTaskId<T extends { taskId?: string }>(items: T[]) {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    if (!item.taskId) return acc;
    if (!acc[item.taskId]) acc[item.taskId] = [];
    acc[item.taskId]!.push(item);
    return acc;
  }, {});
}

export default defineEventHandler(async (event): Promise<DashboardPayload> => {
  requireAuthUser(event);

  const [rawAgents, rawTasks, rawMessages, rawActivities, rawDocuments, rawNotifications] =
    await Promise.all([
      convexQuery<any[]>("agents:list"),
      convexQuery<any[]>("tasks:list"),
      convexQuery<any[]>("messages:list"),
      convexQuery<any[]>("activities:list"),
      convexQuery<any[]>("documents:list"),
      convexQuery<any[]>("notifications:list"),
    ]);

  const agents = rawAgents.map((agent) => ({
    id: String(agent._id),
    name: String(agent.name ?? "Agent"),
    role: String(agent.role ?? "unknown"),
    avatarEmoji: String(agent.avatarEmoji ?? "🤖"),
    status:
      agent.status === "active" || agent.status === "blocked"
        ? agent.status
        : "idle",
    currentTaskId: agent.currentTaskId ? String(agent.currentTaskId) : null,
    lastHeartbeatAt: agent.lastHeartbeatAt ?? null,
    capabilities: Array.isArray(agent.capabilities)
      ? agent.capabilities.map((c: unknown) => String(c))
      : [],
  }));

  const agentById = Object.fromEntries(agents.map((a) => [a.id, a]));

  const tasks = rawTasks.map((task) => ({
    id: String(task._id),
    title: String(task.title ?? "Untitled task"),
    description: String(task.description ?? ""),
    status: normalizeTaskStatus(String(task.status ?? "inbox")),
    priority: normalizePriority(String(task.priority ?? "medium")),
    assigneeIds: Array.isArray(task.assigneeIds)
      ? task.assigneeIds.map((id: unknown) => String(id))
      : [],
    tags: Array.isArray(task.tags)
      ? task.tags.map((tag: unknown) => String(tag))
      : [],
    labels: Array.isArray(task.labels)
      ? task.labels.map((label: unknown) => String(label))
      : Array.isArray(task.tags)
        ? task.tags.map((tag: unknown) => String(tag))
        : [],
    createdAt:
      typeof task.createdAt === "number"
        ? task.createdAt
        : Number(task._creationTime ?? Date.now()),
    updatedAt:
      typeof task.updatedAt === "number"
        ? task.updatedAt
        : Number(task._creationTime ?? Date.now()),
    parentTaskId: task.parentTaskId ? String(task.parentTaskId) : undefined,
    blockedReason: task.blockedReason
      ? String(task.blockedReason)
      : undefined,
    subscriberIds: Array.isArray(task.subscriberIds)
      ? task.subscriberIds.map((id: unknown) => String(id))
      : [],
    dueDate: typeof task.dueDate === "number" ? task.dueDate : undefined,
  }));

  const messages = rawMessages.map((message: any) => ({
    id: String(message._id),
    taskId: String(message.taskId ?? ""),
    fromAgentId: message.fromAgentId ? String(message.fromAgentId) : undefined,
    fromUserId: message.fromUserId ? String(message.fromUserId) : undefined,
    content: String(message.content ?? ""),
    attachments: Array.isArray(message.attachments)
      ? message.attachments.map((id: unknown) => String(id))
      : [],
    timestampLabel: toTimestampLabel(message.createdAt),
    type: message.type ?? "comment",
  }));

  const activities = rawActivities.map((activity: any) => ({
    id: String(activity._id),
    taskId: activity.taskId ? String(activity.taskId) : undefined,
    type: String(activity.type ?? "status_changed"),
    agentId: activity.agentId ? String(activity.agentId) : undefined,
    message: String(activity.message ?? ""),
    timestampLabel: toTimestampLabel(activity.createdAt),
    createdAt:
      typeof activity.createdAt === "number" ? activity.createdAt : 0,
  }));

  const documents = rawDocuments.map((doc: any) => ({
    id: String(doc._id),
    taskId: doc.taskId ? String(doc.taskId) : undefined,
    title: String(doc.title ?? "Documento"),
    type: normalizeDocType(String(doc.type ?? "deliverable")),
    content: String(doc.content ?? ""),
    agentId: doc.agentId ? String(doc.agentId) : undefined,
  }));

  const notifications = rawNotifications.map((notif: any) => ({
    id: String(notif._id),
    taskId: notif.taskId ? String(notif.taskId) : undefined,
    mentionedAgentId: String(notif.mentionedAgentId ?? ""),
    content: String(notif.content ?? ""),
    delivered: Boolean(notif.delivered),
  }));

  const feed = activities
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 50)
    .map((activity) => ({
      id: activity.id,
      type: activity.type,
      author: activity.agentId
        ? agentById[activity.agentId]?.name ?? "Agent"
        : "System",
      agentId: activity.agentId || undefined,
      taskId: activity.taskId || undefined,
      summary: activity.message,
      timestampLabel: activity.timestampLabel,
    }));

  return {
    agents,
    tasks,
    feed,
    columns: COLUMNS,
    messagesByTask: groupByTaskId(messages),
    activitiesByTask: groupByTaskId(activities),
    documentsByTask: groupByTaskId(documents),
    notificationsByTask: groupByTaskId(notifications),
  };
});

function normalizeDocType(value: string) {
  const valid = ["deliverable", "research", "protocol", "report", "audit"];
  return valid.includes(value) ? value : "deliverable";
}
