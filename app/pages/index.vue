<script setup lang="ts">
import type { TaskStatus } from "~/types/mission";
import { useMissionMockData } from "~/composables/useMissionMockData";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const {
  agents,
  tasks,
  feed,
  columns,
  messagesByTask,
  activitiesByTask,
  documentsByTask,
  notificationsByTask,
} = useMissionMockData();
const router = useRouter();
const selectedTaskId = ref<string | null>(tasks[0]?.id ?? null);

const selectedTask = computed(
  () => tasks.find((task) => task.id === selectedTaskId.value) ?? null,
);

const selectedMessages = computed(() => {
  if (!selectedTask.value) {
    return [];
  }
  return messagesByTask[selectedTask.value.id] ?? [];
});

const selectedActivities = computed(() => {
  if (!selectedTask.value) {
    return [];
  }
  return activitiesByTask[selectedTask.value.id] ?? [];
});

const selectedDocuments = computed(() => {
  if (!selectedTask.value) {
    return [];
  }
  return documentsByTask[selectedTask.value.id] ?? [];
});

const selectedNotifications = computed(() => {
  if (!selectedTask.value) {
    return [];
  }
  return notificationsByTask[selectedTask.value.id] ?? [];
});

const activeAgents = computed(
  () => agents.filter((agent) => agent.status === "active").length,
);
const queuedTasks = computed(
  () => tasks.filter((task) => task.status !== "done").length,
);
const reviewingTasks = computed(
  () => tasks.filter((task) => task.status === ("review" as TaskStatus)).length,
);

async function logout() {
  await $fetch("/api/auth/logout", { method: "POST" });
  await router.push("/login");
}

function onSelectTask(task: { id: string }) {
  selectedTaskId.value = task.id;
}
</script>

<template>
  <div class="min-h-screen pb-3">
    <MissionHeader
      :active-agents="activeAgents"
      :queued-tasks="queuedTasks"
      :reviewing-tasks="reviewingTasks"
      @logout="logout"
    />

    <main class="mx-3 mt-3 flex gap-3">
      <AgentsRail :agents="agents" />
      <KanbanBoard
        :tasks="tasks"
        :columns="columns"
        @select-task="onSelectTask"
      />
      <TaskDetailPanel
        :task="selectedTask"
        :agents="agents"
        :messages="selectedMessages"
        :activities="selectedActivities"
        :documents="selectedDocuments"
        :notifications="selectedNotifications"
      />
      <LiveFeed :feed="feed" />
    </main>
  </div>
</template>
