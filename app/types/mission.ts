export type AgentStatus = "idle" | "active" | "blocked";

export type TaskStatus =
  | "inbox"
  | "assigned"
  | "in_progress"
  | "review"
  | "blocked"
  | "done";

export type Agent = {
  id: string;
  name: string;
  role: string;
  avatarEmoji: string;
  status: AgentStatus;
  currentTaskId: string | null;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assigneeIds: string[];
  tags: string[];
  labels: string[];
  createdAt: number;
  parentTaskId?: string;
  blockedReason?: string;
};

export type FeedEvent = {
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
};

export type TaskMessage = {
  id: string;
  taskId: string;
  fromAgentId: string;
  content: string;
  attachments: string[];
  timestampLabel: string;
};

export type TaskActivity = {
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
};

export type TaskDocument = {
  id: string;
  taskId: string;
  title: string;
  type: "deliverable" | "research" | "protocol";
  content: string;
};

export type TaskNotification = {
  id: string;
  taskId: string;
  mentionedAgentId: string;
  content: string;
  delivered: boolean;
};
