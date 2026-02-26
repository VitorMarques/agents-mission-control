import { convexQuery } from "~~/server/utils/convexClient";
import { requireAuthUser } from "~~/server/utils/requestAuth";

type TaskStatus = "inbox" | "assigned" | "in_progress" | "review" | "done";

type DashboardPayload = {
  agents: Array<{
    id: string;
    name: string;
    role: string;
    avatarEmoji: string;
    status: "idle" | "active" | "blocked";
    currentTaskId: string | null;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    assigneeIds: string[];
    tags: string[];
    labels: string[];
    createdAt: number;
  }>;
  feed: Array<{
    id: string;
    type:
      | "task_created"
      | "message_sent"
      | "status_changed"
      | "document_created"
      | "decision";
    author: string;
    agentId?: string;
    taskId?: string;
    summary: string;
    timestampLabel: string;
  }>;
  columns: Array<{ status: TaskStatus; label: string }>;
  messagesByTask: Record<
    string,
    Array<{
      id: string;
      taskId: string;
      fromAgentId: string;
      content: string;
      attachments: string[];
      timestampLabel: string;
    }>
  >;
  activitiesByTask: Record<
    string,
    Array<{
      id: string;
      taskId: string;
      type:
        | "task_created"
        | "message_sent"
        | "document_created"
        | "status_changed"
        | "decision";
      agentId: string;
      message: string;
      timestampLabel: string;
    }>
  >;
  documentsByTask: Record<
    string,
    Array<{
      id: string;
      taskId: string;
      title: string;
      type: "deliverable" | "research" | "protocol";
      content: string;
    }>
  >;
  notificationsByTask: Record<
    string,
    Array<{
      id: string;
      taskId: string;
      mentionedAgentId: string;
      content: string;
      delivered: boolean;
    }>
  >;
};

const COLUMNS: DashboardPayload["columns"] = [
  { status: "inbox", label: "Inbox" },
  { status: "assigned", label: "Assigned" },
  { status: "in_progress", label: "In Progress" },
  { status: "review", label: "Review" },
  { status: "done", label: "Done" },
];

function toTimestampLabel(createdAt?: number) {
  if (!createdAt) {
    return "agora";
  }

  const minutes = Math.max(1, Math.floor((Date.now() - createdAt) / 60000));
  if (minutes < 60) {
    return `há ${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `há ${hours} h`;
  }

  const days = Math.floor(hours / 24);
  return `há ${days} d`;
}

function normalizeTaskStatus(value: string): TaskStatus {
  if (value === "pending") {
    return "inbox";
  }

  if (
    value === "inbox" ||
    value === "assigned" ||
    value === "in_progress" ||
    value === "review" ||
    value === "done"
  ) {
    return value;
  }

  return "inbox";
}

function groupByTaskId<T extends { taskId: string }>(items: T[]) {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    if (!item.taskId) {
      return acc;
    }

    if (!acc[item.taskId]) {
      acc[item.taskId] = [];
    }

    acc[item.taskId]?.push(item);
    return acc;
  }, {});
}

export default defineEventHandler(async (event): Promise<DashboardPayload> => {
  requireAuthUser(event);

  const [
    rawAgents,
    rawTasks,
    rawMessages,
    rawActivities,
    rawDocuments,
    rawNotifications,
  ] = await Promise.all([
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
  }));

  const agentById = Object.fromEntries(
    agents.map((agent) => [agent.id, agent]),
  );

  const tasks = rawTasks.map((task) => ({
    id: String(task._id),
    title: String(task.title ?? "Untitled task"),
    description: String(task.description ?? ""),
    status: normalizeTaskStatus(String(task.status ?? "inbox")),
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
  }));

  const messages = rawMessages.map((message) => ({
    id: String(message._id),
    taskId: String(message.taskId ?? ""),
    fromAgentId: String(message.fromAgentId ?? ""),
    content: String(message.content ?? ""),
    attachments: Array.isArray(message.attachments)
      ? message.attachments.map((id: unknown) => String(id))
      : [],
    timestampLabel: toTimestampLabel(message.createdAt),
  }));

  const activities = rawActivities.map((activity) => ({
    id: String(activity._id),
    taskId: String(activity.taskId ?? ""),
    type:
      activity.type === "task_created" ||
      activity.type === "message_sent" ||
      activity.type === "document_created" ||
      activity.type === "decision"
        ? activity.type
        : "status_changed",
    agentId: String(activity.agentId ?? ""),
    message: String(activity.message ?? ""),
    timestampLabel: toTimestampLabel(activity.createdAt),
    createdAt: typeof activity.createdAt === "number" ? activity.createdAt : 0,
  }));

  const documents = rawDocuments.map((document) => ({
    id: String(document._id),
    taskId: String(document.taskId ?? ""),
    title: String(document.title ?? "Documento"),
    type:
      document.type === "research" || document.type === "protocol"
        ? document.type
        : "deliverable",
    content: String(document.content ?? ""),
  }));

  const notifications = rawNotifications.map((notification) => ({
    id: String(notification._id),
    taskId: String(notification.taskId ?? ""),
    mentionedAgentId: String(notification.mentionedAgentId ?? ""),
    content: String(notification.content ?? ""),
    delivered: Boolean(notification.delivered),
  }));

  const feed = activities
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 12)
    .map((activity) => ({
      id: activity.id,
      type: activity.type,
      author: agentById[activity.agentId]?.name ?? "Agent",
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
