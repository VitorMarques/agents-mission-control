<script setup lang="ts">
import type {
  Agent,
  FeedEvent,
  Task,
  TaskActivity,
  TaskDocument,
  TaskMessage,
  TaskNotification,
} from "~/types/mission";
import { computed, ref } from "vue";

const props = defineProps<{
  feed: FeedEvent[];
  agents: Agent[];
  tasks: Task[];
  messagesByTask: Record<string, TaskMessage[]>;
  activitiesByTask: Record<string, TaskActivity[]>;
  documentsByTask: Record<string, TaskDocument[]>;
  notificationsByTask: Record<string, TaskNotification[]>;
}>();

const selectedAgentId = ref<string>("all");
const expandedEventId = ref<string | null>(null);

const taskById = computed<Record<string, Task>>(() => {
  return props.tasks.reduce<Record<string, Task>>((acc, task) => {
    acc[task.id] = task;
    return acc;
  }, {});
});

const filteredFeed = computed(() => {
  if (selectedAgentId.value === "all") {
    return props.feed;
  }
  return props.feed.filter((event) => event.agentId === selectedAgentId.value);
});

function toggleExpand(eventId: string) {
  expandedEventId.value = expandedEventId.value === eventId ? null : eventId;
}

function contextForTask(taskId?: string) {
  if (!taskId) {
    return {
      task: null,
      messages: [] as TaskMessage[],
      activities: [] as TaskActivity[],
      documents: [] as TaskDocument[],
      notifications: [] as TaskNotification[],
    };
  }

  return {
    task: taskById.value[taskId] ?? null,
    messages: props.messagesByTask[taskId] ?? [],
    activities: props.activitiesByTask[taskId] ?? [],
    documents: props.documentsByTask[taskId] ?? [],
    notifications: props.notificationsByTask[taskId] ?? [],
  };
}
</script>

<template>
  <aside
    class="panel scroll-thin hidden h-[calc(100vh-6.5rem)] min-w-[290px] flex-col overflow-y-auto p-3 xl:flex"
  >
    <div class="mb-3 flex items-center justify-between">
      <h2
        class="text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--muted-foreground))]"
      >
        Live Feed
      </h2>
      <span
        class="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
        >Live</span
      >
    </div>

    <div class="mb-3 flex flex-wrap gap-1">
      <button
        class="panel-muted px-2 py-1 text-[11px]"
        :class="selectedAgentId === 'all' ? 'ring-1 ring-amber-400' : ''"
        @click="selectedAgentId = 'all'"
      >
        All Agents
      </button>
      <button
        v-for="agent in props.agents"
        :key="agent.id"
        class="panel-muted px-2 py-1 text-[11px]"
        :class="selectedAgentId === agent.id ? 'ring-1 ring-amber-400' : ''"
        @click="selectedAgentId = agent.id"
      >
        {{ agent.avatarEmoji }} {{ agent.name }}
      </button>
    </div>

    <ul class="space-y-2">
      <li v-for="event in filteredFeed" :key="event.id" class="panel-muted p-2">
        <button
          class="w-full text-left"
          type="button"
          @click="toggleExpand(event.id)"
        >
          <p
            class="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted-foreground))]"
          >
            {{ event.author }}
          </p>
          <p class="text-sm">{{ event.summary }}</p>
          <p class="mt-1 text-xs text-[rgb(var(--muted-foreground))]">
            {{ event.timestampLabel }}
          </p>
        </button>

        <div
          v-if="expandedEventId === event.id"
          class="mt-2 space-y-2 border-t border-[rgb(var(--border))] pt-2 text-xs"
        >
          <template v-if="contextForTask(event.taskId).task">
            <p class="font-semibold">
              Task: {{ contextForTask(event.taskId).task?.title }}
            </p>
            <p class="text-[rgb(var(--muted-foreground))]">
              {{ contextForTask(event.taskId).task?.description }}
            </p>
            <p>
              Status atual:
              <span class="font-semibold uppercase">{{
                contextForTask(event.taskId).task?.status
              }}</span>
            </p>
          </template>

          <div>
            <p class="font-semibold">Comentários</p>
            <ul class="list-disc pl-4 text-[rgb(var(--muted-foreground))]">
              <li
                v-for="message in contextForTask(event.taskId).messages.slice(
                  0,
                  3,
                )"
                :key="message.id"
              >
                {{ message.content }}
              </li>
              <li v-if="contextForTask(event.taskId).messages.length === 0">
                Nenhum comentário.
              </li>
            </ul>
          </div>

          <div>
            <p class="font-semibold">Atividades</p>
            <ul class="list-disc pl-4 text-[rgb(var(--muted-foreground))]">
              <li
                v-for="activity in contextForTask(
                  event.taskId,
                ).activities.slice(0, 3)"
                :key="activity.id"
              >
                {{ activity.message }}
              </li>
              <li v-if="contextForTask(event.taskId).activities.length === 0">
                Nenhuma atividade.
              </li>
            </ul>
          </div>

          <div>
            <p class="font-semibold">Documentos</p>
            <ul class="list-disc pl-4 text-[rgb(var(--muted-foreground))]">
              <li
                v-for="document in contextForTask(event.taskId).documents.slice(
                  0,
                  3,
                )"
                :key="document.id"
              >
                {{ document.title }}
              </li>
              <li v-if="contextForTask(event.taskId).documents.length === 0">
                Nenhum documento.
              </li>
            </ul>
          </div>

          <div>
            <p class="font-semibold">Menções / Notificações</p>
            <ul class="list-disc pl-4 text-[rgb(var(--muted-foreground))]">
              <li
                v-for="notification in contextForTask(
                  event.taskId,
                ).notifications.slice(0, 3)"
                :key="notification.id"
              >
                {{ notification.content }}
              </li>
              <li
                v-if="contextForTask(event.taskId).notifications.length === 0"
              >
                Nenhuma menção.
              </li>
            </ul>
          </div>

          <div
            v-if="
              contextForTask(event.taskId).activities.some(
                (a) => a.type === 'decision',
              )
            "
            class="rounded-md bg-amber-100/70 px-2 py-1 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200"
          >
            Este item contém decisão registrada.
          </div>
        </div>
      </li>
    </ul>
  </aside>
</template>
