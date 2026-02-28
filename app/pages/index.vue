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
const tasksState = ref<Task[]>([]);
const tasks = computed(() => tasksState.value);
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
  () => data.value?.tasks,
  (nextTasks) => {
    tasksState.value = (nextTasks ?? []).map((task) => ({
      ...task,
      assigneeIds: [...task.assigneeIds],
      labels: [...task.labels],
      tags: [...task.tags],
    }));
  },
  { immediate: true },
);

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
  showTaskModal.value = true;
}

function closeTaskModal() {
  showTaskModal.value = false;
}

function applyTaskStatusLocal(taskId: string, status: TaskStatus) {
  tasksState.value = tasksState.value.map((task) => {
    if (task.id !== taskId) {
      return task;
    }
    return {
      ...task,
      status,
    };
  });
}

async function onMoveTaskStatus(payload: {
  taskId: string;
  status: TaskStatus;
}) {
  if (!canMoveStatus.value) {
    return;
  }

  const currentStatus =
    data.value?.tasks.find((task) => task.id === payload.taskId)?.status ??
    null;

  if (currentStatus === payload.status) {
    return;
  }

  applyTaskStatusLocal(payload.taskId, payload.status);

  try {
    await $fetch(`/api/tasks/${payload.taskId}/status`, {
      method: "PATCH",
      body: {
        status: payload.status,
      },
    });
  } catch (err) {
    if (currentStatus) {
      applyTaskStatusLocal(payload.taskId, currentStatus);
    }
    throw err;
  }
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

    <main class="mx-2 mt-2 flex flex-col gap-2 lg:mx-3 lg:mt-3 lg:flex-row lg:gap-3">
      <!-- Loading state -->
      <div
        v-if="pending"
        class="panel-muted flex h-[calc(100vh-5rem)] flex-1 items-center justify-center text-sm text-[rgb(var(--muted-foreground))] lg:h-[calc(100vh-6.5rem)]"
      >
        Carregando dados da missão...
      </div>

      <!-- Error state -->
      <div
        v-else-if="error"
        class="panel-muted flex h-[calc(100vh-5rem)] flex-1 flex-col items-center justify-center gap-3 text-center lg:h-[calc(100vh-6.5rem)]"
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
        <!-- AgentsRail - Desktop sidebar + Mobile drawer -->
        <AgentsRail :agents="agents" />

        <!-- KanbanBoard -->
        <KanbanBoard
          :tasks="tasks"
          :columns="columns"
          :agents="agents"
          :can-move-status="canMoveStatus"
          @select-task="onSelectTask"
          @move-task-status="onMoveTaskStatus"
        />
        <TaskDetailModal
          v-if="showTaskModal"
          :task="selectedTask"
          :agents="agents"
          :messages="selectedMessages"
          :activities="selectedActivities"
          :documents="selectedDocuments"
          :notifications="selectedNotifications"
          @close="closeTaskModal"
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
  </div>
</template>
