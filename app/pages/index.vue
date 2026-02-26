<script setup lang="ts">
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
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";

type DashboardData = {
  agents: Agent[];
  tasks: Task[];
  feed: FeedEvent[];
  columns: Array<{ status: TaskStatus; label: string }>;
  messagesByTask: Record<string, TaskMessage[]>;
  activitiesByTask: Record<string, TaskActivity[]>;
  documentsByTask: Record<string, TaskDocument[]>;
  notificationsByTask: Record<string, TaskNotification[]>;
};

const { data, pending, error, refresh } = await useFetch<DashboardData>(
  "/api/mission/dashboard",
);
const { data: meData } = await useFetch<{
  user: { role: "ADMIN" | "MANAGER" | "VIEWER" };
}>("/api/auth/me");

const router = useRouter();

const agents = computed(() => data.value?.agents ?? []);
const tasks = computed(() => data.value?.tasks ?? []);
const feed = computed(() => data.value?.feed ?? []);
const columns = computed<DashboardData["columns"]>(
  () =>
    data.value?.columns ?? [
      { status: "inbox", label: "Inbox" },
      { status: "assigned", label: "Assigned" },
      { status: "in_progress", label: "In Progress" },
      { status: "review", label: "Review" },
      { status: "done", label: "Done" },
    ],
);

const selectedTaskId = ref<string | null>(null);
const showTaskModal = ref(false);

watch(
  tasks,
  (nextTasks) => {
    const stillExists = nextTasks.some(
      (task) => task.id === selectedTaskId.value,
    );
    if (stillExists) {
      return;
    }
    selectedTaskId.value = nextTasks[0]?.id ?? null;
  },
  { immediate: true },
);

const selectedTask = computed(
  () => tasks.value.find((task) => task.id === selectedTaskId.value) ?? null,
);

const messagesByTask = computed(() => data.value?.messagesByTask ?? {});
const activitiesByTask = computed(() => data.value?.activitiesByTask ?? {});
const documentsByTask = computed(() => data.value?.documentsByTask ?? {});
const notificationsByTask = computed(
  () => data.value?.notificationsByTask ?? {},
);

const selectedMessages = computed(() => {
  if (!selectedTask.value) {
    return [];
  }
  return messagesByTask.value[selectedTask.value.id] ?? [];
});

const selectedActivities = computed(() => {
  if (!selectedTask.value) {
    return [];
  }
  return activitiesByTask.value[selectedTask.value.id] ?? [];
});

const selectedDocuments = computed(() => {
  if (!selectedTask.value) {
    return [];
  }
  return documentsByTask.value[selectedTask.value.id] ?? [];
});

const selectedNotifications = computed(() => {
  if (!selectedTask.value) {
    return [];
  }
  return notificationsByTask.value[selectedTask.value.id] ?? [];
});

const activeAgents = computed(
  () => agents.value.filter((agent) => agent.status === "active").length,
);
const queuedTasks = computed(
  () => tasks.value.filter((task) => task.status !== "done").length,
);
const reviewingTasks = computed(
  () =>
    tasks.value.filter((task) => task.status === ("review" as TaskStatus))
      .length,
);

const missionStatus = computed<"online" | "loading" | "degraded">(() => {
  if (pending.value) {
    return "loading";
  }
  if (error.value) {
    return "degraded";
  }
  return "online";
});

const canMoveStatus = computed(() => {
  const role = meData.value?.user?.role;
  return role === "ADMIN" || role === "MANAGER";
});

async function logout() {
  await $fetch("/api/auth/logout", { method: "POST" });
  await router.push("/login");
}

function onSelectTask(task: { id: string }) {
  selectedTaskId.value = task.id;
}

function openTaskModal() {
  if (!selectedTask.value) {
    return;
  }
  showTaskModal.value = true;
}

function closeTaskModal() {
  showTaskModal.value = false;
}

async function onMoveTaskStatus(payload: {
  taskId: string;
  status: TaskStatus;
}) {
  if (!canMoveStatus.value) {
    return;
  }

  await $fetch(`/api/tasks/${payload.taskId}/status`, {
    method: "PATCH",
    body: {
      status: payload.status,
    },
  });

  await refresh();
}
</script>

<template>
  <div class="min-h-screen pb-3">
    <MissionHeader
      :active-agents="activeAgents"
      :queued-tasks="queuedTasks"
      :reviewing-tasks="reviewingTasks"
      :mission-status="missionStatus"
      @logout="logout"
    />

    <main class="mx-3 mt-3 flex gap-3">
      <div
        v-if="pending"
        class="panel-muted flex h-[calc(100vh-6.5rem)] flex-1 items-center justify-center text-sm text-[rgb(var(--muted-foreground))]"
      >
        Carregando dados da missão...
      </div>

      <div
        v-else-if="error"
        class="panel-muted flex h-[calc(100vh-6.5rem)] flex-1 flex-col items-center justify-center gap-3 text-center"
      >
        <p class="text-sm text-red-500">Falha ao carregar dados do Convex.</p>
        <button
          class="panel px-3 py-1.5 text-xs font-medium"
          @click="refresh()"
        >
          Tentar novamente
        </button>
      </div>

      <template v-else>
        <AgentsRail :agents="agents" />
        <KanbanBoard
          :tasks="tasks"
          :columns="columns"
          :agents="agents"
          :can-move-status="canMoveStatus"
          @select-task="onSelectTask"
          @move-task-status="onMoveTaskStatus"
        />
        <div class="absolute right-6 top-[5.75rem] z-20">
          <button
            class="panel-muted px-3 py-1.5 text-xs"
            :disabled="!selectedTask"
            @click="openTaskModal"
          >
            Abrir card em popup
          </button>
        </div>
        <TaskDetailPanel
          :task="selectedTask"
          :agents="agents"
          :messages="selectedMessages"
          :activities="selectedActivities"
          :documents="selectedDocuments"
          :notifications="selectedNotifications"
          :can-move-status="canMoveStatus"
          @move-task-status="onMoveTaskStatus"
        />
        <LiveFeed
          :feed="feed"
          :agents="agents"
          :tasks="tasks"
          :messages-by-task="messagesByTask"
          :activities-by-task="activitiesByTask"
          :documents-by-task="documentsByTask"
          :notifications-by-task="notificationsByTask"
        />
      </template>
    </main>

    <div
      v-if="showTaskModal && selectedTask"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      @click.self="closeTaskModal"
    >
      <TaskDetailPanel
        :task="selectedTask"
        :agents="agents"
        :messages="selectedMessages"
        :activities="selectedActivities"
        :documents="selectedDocuments"
        :notifications="selectedNotifications"
        :can-move-status="canMoveStatus"
        mode="modal"
        @move-task-status="onMoveTaskStatus"
        @close="closeTaskModal"
      />
    </div>
  </div>
</template>
