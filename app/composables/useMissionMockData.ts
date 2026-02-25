import type { Agent, FeedEvent, Task, TaskStatus } from "~/types/mission";

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

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "inbox", label: "Inbox" },
  { status: "assigned", label: "Assigned" },
  { status: "in_progress", label: "In Progress" },
  { status: "review", label: "Review" },
  { status: "done", label: "Done" },
];

export function useMissionMockData() {
  return {
    agents: AGENTS,
    tasks: TASKS,
    feed: FEED,
    columns: COLUMNS,
  };
}
