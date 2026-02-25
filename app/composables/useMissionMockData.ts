import type {
  Agent,
  FeedEvent,
  Task,
  TaskActivity,
  TaskDocument,
  TaskMessage,
  TaskNotification,
  TaskStatus,
} from "~/types/mission";

const AGENTS: Agent[] = [
  {
    id: "a1",
    name: "Bhanu",
    role: "Founder",
    status: "active",
    currentTaskId: "t1",
  },
  {
    id: "a2",
    name: "Friday",
    role: "Developer",
    status: "active",
    currentTaskId: "t3",
  },
  {
    id: "a3",
    name: "Shuri",
    role: "Product Analyst",
    status: "idle",
    currentTaskId: null,
  },
  {
    id: "a4",
    name: "Loki",
    role: "Content Writer",
    status: "blocked",
    currentTaskId: "t4",
  },
];

const TASKS: Task[] = [
  {
    id: "t1",
    title: "Explore SiteGPT dashboard features",
    description: "Mapear funcionalidades do painel e métricas chave.",
    status: "inbox",
    assigneeIds: ["a1", "a3"],
    labels: ["research", "documentation"],
  },
  {
    id: "t2",
    title: "Customer tweet material",
    description: "Criar pacote de conteúdo para social.",
    status: "assigned",
    assigneeIds: ["a4"],
    labels: ["social", "content"],
  },
  {
    id: "t3",
    title: "Mission Control UI foundation",
    description: "Estruturar layout base do dashboard.",
    status: "in_progress",
    assigneeIds: ["a2"],
    labels: ["frontend", "nuxt"],
  },
  {
    id: "t4",
    title: "Shopify integration landing draft",
    description: "Definir outline inicial de entrega.",
    status: "review",
    assigneeIds: ["a4"],
    labels: ["copy", "review"],
  },
  {
    id: "t5",
    title: "Publish weekly report",
    description: "Consolidar status da semana e pendências.",
    status: "done",
    assigneeIds: ["a1"],
    labels: ["report"],
  },
];

const FEED: FeedEvent[] = [
  {
    id: "f1",
    type: "message_sent",
    author: "Loki",
    summary: "Comentou na task “Customer tweet material”.",
    timestampLabel: "há 2 minutos",
  },
  {
    id: "f2",
    type: "status_changed",
    author: "Friday",
    summary: "Moveu “Mission Control UI foundation” para in_progress.",
    timestampLabel: "há 8 minutos",
  },
  {
    id: "f3",
    type: "document_created",
    author: "Bhanu",
    summary: "Criou documento “Sprint Mission Notes”.",
    timestampLabel: "há 24 minutos",
  },
];

const MESSAGES: TaskMessage[] = [
  {
    id: "m1",
    taskId: "t1",
    fromAgentId: "a3",
    content:
      "Iniciei o levantamento das funcionalidades. @Bhanu podemos priorizar integrações?",
    attachments: ["d1"],
    timestampLabel: "há 15 min",
  },
  {
    id: "m2",
    taskId: "t3",
    fromAgentId: "a2",
    content: "Estrutura base pronta. @Shuri preciso validar os KPIs do header.",
    attachments: [],
    timestampLabel: "há 5 min",
  },
];

const ACTIVITIES: TaskActivity[] = [
  {
    id: "act1",
    taskId: "t1",
    type: "task_created",
    agentId: "a1",
    message: "Task criada no backlog de descoberta.",
    timestampLabel: "hoje 09:10",
  },
  {
    id: "act2",
    taskId: "t3",
    type: "status_changed",
    agentId: "a2",
    message: "Status alterado para in_progress.",
    timestampLabel: "hoje 13:42",
  },
];

const DOCUMENTS: TaskDocument[] = [
  {
    id: "d1",
    taskId: "t1",
    title: "Feature Discovery Brief",
    type: "research",
    content:
      "# Discovery\n\n- Features mapeadas\n- Riscos técnicos\n- Próximos passos",
  },
  {
    id: "d2",
    taskId: "t3",
    title: "UI Implementation Protocol",
    type: "protocol",
    content: "# Protocol\n\n1. Build shell\n2. Integrar dados\n3. Validar UX",
  },
];

const NOTIFICATIONS: TaskNotification[] = [
  {
    id: "n1",
    taskId: "t1",
    mentionedAgentId: "a1",
    content: "@Bhanu foi mencionado em Feature Discovery Brief.",
    delivered: false,
  },
  {
    id: "n2",
    taskId: "t3",
    mentionedAgentId: "a3",
    content: "@Shuri foi mencionado em Mission Control UI foundation.",
    delivered: false,
  },
];

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "inbox", label: "Inbox" },
  { status: "assigned", label: "Assigned" },
  { status: "in_progress", label: "In Progress" },
  { status: "review", label: "Review" },
  { status: "done", label: "Done" },
];

function groupByTaskId<T extends { taskId: string }>(items: T[]) {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    if (!acc[item.taskId]) {
      acc[item.taskId] = [];
    }

    const list = acc[item.taskId];
    if (list) {
      list.push(item);
    }
    return acc;
  }, {});
}

export function useMissionMockData() {
  return {
    agents: AGENTS,
    tasks: TASKS,
    feed: FEED,
    columns: COLUMNS,
    messagesByTask: groupByTaskId(MESSAGES),
    activitiesByTask: groupByTaskId(ACTIVITIES),
    documentsByTask: groupByTaskId(DOCUMENTS),
    notificationsByTask: groupByTaskId(NOTIFICATIONS),
  };
}
