export type AgentStatus = 'idle' | 'active' | 'blocked'

export type TaskStatus = 'inbox' | 'assigned' | 'in_progress' | 'review' | 'done'

export type Agent = {
  id: string
  name: string
  role: string
  status: AgentStatus
  currentTaskId: string | null
}

export type Task = {
  id: string
  title: string
  description: string
  status: TaskStatus
  assigneeIds: string[]
  labels: string[]
}

export type FeedEvent = {
  id: string
  type: 'task_created' | 'message_sent' | 'status_changed' | 'document_created'
  author: string
  summary: string
  timestampLabel: string
}
