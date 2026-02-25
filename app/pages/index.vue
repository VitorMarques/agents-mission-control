<script setup lang="ts">
import type { TaskStatus } from "~/types/mission";
import { useMissionMockData } from "~/composables/useMissionMockData";

const { agents, tasks, feed, columns } = useMissionMockData();
const router = useRouter();

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
      <KanbanBoard :tasks="tasks" :columns="columns" />
      <LiveFeed :feed="feed" />
    </main>
  </div>
</template>
