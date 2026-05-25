export type AgentStatus = "idle" | "active" | "blocked";

export type TaskStatus =
  | "inbox"
  | "assigned"
  | "in_progress"
  | "review"
  | "blocked"
  | "done";

export type TaskPriority = "low" | "medium" | "high" | "critical";

export type MessageType = "comment" | "decision" | "status_update";

export type DocumentType =
  | "deliverable"
  | "research"
  | "protocol"
  | "report"
  | "audit";

export type Agent = {
  id: string;
  name: string;
  role: string;
  avatarEmoji: string;
  status: AgentStatus;
  currentTaskId: string | null;
  lastHeartbeatAt: number | null;
  capabilities: string[];
};

export type Task = {
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
};

export type FeedEvent = {
  id: string;
  type:
    | "task_created"
    | "message_sent"
    | "status_changed"
    | "document_created"
    | "decision"
    | "agent_status_changed"
    | "task_delegated"
    | "task_blocked"
    | "agent_created";
  author: string;
  agentId?: string;
  taskId?: string;
  summary: string;
  timestampLabel: string;
};

export type TaskMessage = {
  id: string;
  taskId: string;
  fromAgentId?: string;
  fromUserId?: string;
  content: string;
  attachments: string[];
  timestampLabel: string;
  type: MessageType;
};

export type TaskActivity = {
  id: string;
  taskId?: string;
  type: string;
  agentId?: string;
  message: string;
  timestampLabel: string;
  createdAt: number;
};

export type TaskDocument = {
  id: string;
  taskId?: string;
  title: string;
  type: DocumentType;
  content: string;
  agentId?: string;
};

export type TaskNotification = {
  id: string;
  taskId?: string;
  mentionedAgentId: string;
  content: string;
  delivered: boolean;
};
