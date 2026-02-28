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

const isOpen = ref(false);
const selectedAgentId = ref<string>("all");
const selectedTag = ref<string>("all");
const expandedEventId = ref<string | null>(null);
const agentsFilterOpen = ref(true);
const tagsFilterOpen = ref(true);

function toggleOpen() {
  isOpen.value = !isOpen.value;
}

// Extrair tags únicas das tasks
const allTags = computed(() => {
  const tagSet = new Set<string>();
  props.tasks.forEach((task) => {
    if (task.tags && Array.isArray(task.tags)) {
      task.tags.forEach((tag) => tagSet.add(tag));
    }
  });
  return Array.from(tagSet).sort();
});

// Mapear taskId para tags
const taskTagsMap = computed<Record<string, string[]>>(() => {
  return props.tasks.reduce<Record<string, string[]>>((acc, task) => {
    acc[task.id] = task.tags || [];
    return acc;
  }, {});
});

const taskById = computed<Record<string, Task>>(() => {
  return props.tasks.reduce<Record<string, Task>>((acc, task) => {
    acc[task.id] = task;
    return acc;
  }, {});
});

const filteredFeed = computed(() => {
  return props.feed.filter((event) => {
    const matchesAgent =
      selectedAgentId.value === "all" ||
      event.agentId === selectedAgentId.value;

    const taskTags = event.taskId ? taskTagsMap.value[event.taskId] || [] : [];
    const matchesTag =
      selectedTag.value === "all" || taskTags.includes(selectedTag.value);

    return matchesAgent && matchesTag;
  });
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
  <!-- Botão flutuante para abrir/fechar -->
  <button
    class="fixed bottom-6 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 shadow-lg transition-all hover:bg-amber-600 hover:scale-105 active:scale-95"
    @click="toggleOpen"
    aria-label="Toggle Live Feed"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-5 text-white"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  </button>

  <!-- Backdrop overlay -->
  <Teleport to="body">
    <Transition name="feed-fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-40"
        @click="toggleOpen"
      >
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      </div>
    </Transition>

    <Transition name="feed-slide">
      <aside
        v-if="isOpen"
        class="panel scroll-thin fixed bottom-20 right-4 z-50 w-[290px] max-h-[60vh] overflow-y-auto rounded-lg bg-[rgb(var(--panel))] p-3 shadow-xl"
      >
        <div class="mb-3 flex w-full items-center justify-between">
          <h2
            class="text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--muted-foreground))]"
          >
            Live Feed
          </h2>
          <span
            class="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
          >
            Live
          </span>
        </div>

        <!-- Filtros com seções colapsáveis -->
        <div class="mb-3 space-y-2">
          <!-- Agents Filter Section -->
          <div class="overflow-hidden rounded-md border border-[rgb(var(--border))]">
            <button
              class="flex w-full items-center justify-between bg-[rgb(var(--muted))]/20 px-3 py-2 text-left transition-colors hover:bg-[rgb(var(--muted))]/30"
              @click="agentsFilterOpen = !agentsFilterOpen"
            >
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span class="text-xs font-semibold uppercase tracking-wide">Agents</span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 text-[rgb(var(--muted-foreground))] transition-transform"
                :class="agentsFilterOpen ? 'rotate-180' : ''"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <Transition name="collapse">
              <div v-show="agentsFilterOpen" class="bg-[rgb(var(--panel))]/50 p-2">
                <div class="mb-2 flex flex-wrap gap-1">
                  <button
                    class="rounded-md px-2 py-1 text-[11px] transition-all"
                    :class="selectedAgentId === 'all' ? 'bg-amber-500 text-white' : 'panel-muted hover:bg-amber-500/20'"
                    @click="selectedAgentId = 'all'"
                  >
                    All
                  </button>
                  <button
                    v-for="agent in props.agents"
                    :key="agent.id"
                    class="rounded-md px-2 py-1 text-[11px] transition-all"
                    :class="selectedAgentId === agent.id ? 'bg-amber-500 text-white' : 'panel-muted hover:bg-amber-500/20'"
                    @click="selectedAgentId = agent.id"
                  >
                    {{ agent.avatarEmoji }} {{ agent.name }}
                  </button>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Tags Filter Section -->
          <div class="overflow-hidden rounded-md border border-[rgb(var(--border))]">
            <button
              class="flex w-full items-center justify-between bg-[rgb(var(--muted))]/20 px-3 py-2 text-left transition-colors hover:bg-[rgb(var(--muted))]/30"
              @click="tagsFilterOpen = !tagsFilterOpen"
            >
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
                <span class="text-xs font-semibold uppercase tracking-wide">Tags</span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 text-[rgb(var(--muted-foreground))] transition-transform"
                :class="tagsFilterOpen ? 'rotate-180' : ''"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <Transition name="collapse">
              <div v-show="tagsFilterOpen" class="bg-[rgb(var(--panel))]/50 p-2">
                <div class="flex flex-wrap gap-1">
                  <button
                    class="rounded-md px-2 py-1 text-[11px] transition-all"
                    :class="selectedTag === 'all' ? 'bg-violet-500 text-white' : 'panel-muted hover:bg-violet-500/20'"
                    @click="selectedTag = 'all'"
                  >
                    All
                  </button>
                  <button
                    v-for="tag in allTags"
                    :key="tag"
                    class="rounded-md px-2 py-1 text-[11px] transition-all"
                    :class="selectedTag === tag ? 'bg-violet-500 text-white' : 'panel-muted hover:bg-violet-500/20'"
                    @click="selectedTag = tag"
                  >
                    {{ tag }}
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Feed items -->
        <ul class="space-y-2">
          <li v-for="event in filteredFeed" :key="event.id" class="panel-muted p-2">
            <button
              class="w-full text-left"
              type="button"
              @click="toggleExpand(event.id)"
            >
              <div class="flex items-start justify-between gap-2">
                <p
                  class="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted-foreground))]"
                >
                  {{ event.author }}
                </p>
                <span
                  class="mt-0.5 text-[10px] transition-transform"
                  :class="expandedEventId === event.id ? 'rotate-180' : ''"
                >
                  ▼
                </span>
              </div>
              <p class="text-sm">{{ event.summary }}</p>
              <p class="mt-1 text-xs text-[rgb(var(--muted-foreground))]">
                {{ event.timestampLabel }}
              </p>
            </button>

            <Transition name="feed-expand">
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
                      v-for="message in contextForTask(event.taskId).messages.slice(0, 3)"
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
                      v-for="activity in contextForTask(event.taskId).activities.slice(0, 3)"
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
                      v-for="document in contextForTask(event.taskId).documents.slice(0, 3)"
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
                      v-for="notification in contextForTask(event.taskId).notifications.slice(0, 3)"
                      :key="notification.id"
                    >
                      {{ notification.content }}
                    </li>
                    <li v-if="contextForTask(event.taskId).notifications.length === 0">
                      Nenhuma menção.
                    </li>
                  </ul>
                </div>

                <div
                  v-if="contextForTask(event.taskId).activities.some((a) => a.type === 'decision')"
                  class="rounded-md bg-amber-100/70 px-2 py-1 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200"
                >
                  Este item contém decisão registrada.
                </div>
              </div>
            </Transition>
          </li>
        </ul>
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped>
.feed-fade-enter-active,
.feed-fade-leave-active {
  transition: opacity 200ms ease;
}

.feed-fade-enter-from,
.feed-fade-leave-to {
  opacity: 0;
}

.feed-slide-enter-active,
.feed-slide-leave-active {
  transition: all 250ms ease-out;
}

.feed-slide-enter-from,
.feed-slide-leave-to {
  opacity: 0;
  transform: translateY(16px);
}

.collapse-enter-active,
.collapse-leave-active {
  transition: all 200ms ease-out;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  max-height: 200px;
}

.feed-expand-enter-active,
.feed-expand-leave-active {
  transition: all 180ms ease;
  overflow: hidden;
}

.feed-expand-enter-from,
.feed-expand-leave-to {
  opacity: 0;
  transform: translateY(-4px);
  max-height: 0;
}

.feed-expand-enter-to,
.feed-expand-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 520px;
}
</style>
