<script setup lang="ts">
import type {
  Agent,
  Task,
  TaskActivity,
  TaskDocument,
  TaskMessage,
  TaskNotification,
} from "~/types/mission";
import { computed, ref, watch } from "vue";
import { X } from "lucide-vue-next";

const props = defineProps<{
  task: Task | null;
  agents: Agent[];
  messages: TaskMessage[];
  activities: TaskActivity[];
  documents: TaskDocument[];
  notifications: TaskNotification[];
}>();

const emit = defineEmits<{
  close: [];
}>();

const activeTab = ref<
  "messages" | "activities" | "documents" | "notifications"
>("messages");

const agentById = computed<Record<string, Agent>>(() => {
  return props.agents.reduce<Record<string, Agent>>((acc, agent) => {
    acc[agent.id] = agent;
    return acc;
  }, {});
});

watch(
  () => props.task?.id,
  () => {
    activeTab.value = "messages";
  },
);

const taskTags = computed(() => {
  if (!props.task) {
    return [] as string[];
  }
  return props.task.tags.length > 0 ? props.task.tags : props.task.labels;
});

const assigneeAgent = computed(() => {
  if (!props.task || !props.task.assigneeIds.length) {
    return null;
  }
  const assigneeId = props.task.assigneeIds[0];
  return assigneeId ? (agentById.value[assigneeId] ?? null) : null;
});

function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    emit("close");
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="props.task"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click="handleBackdropClick"
    >
      <div
        class="panel flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden"
      >
        <header class="flex items-start justify-between border-b border-[rgb(var(--border))] p-4">
          <div class="flex-1 pr-4">
            <div class="flex items-center gap-2">
              <p
                class="text-xs uppercase tracking-[0.18em] text-[rgb(var(--muted-foreground))]"
              >
                Task Detail
              </p>
              <span class="text-[rgb(var(--muted-foreground))">|</span>
              <span
                v-if="assigneeAgent"
                class="rounded-md bg-amber-500 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white"
              >
                👤 {{ assigneeAgent.name }}
              </span>
              <span
                v-else
                class="rounded-md bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600"
              >
                👤 Sem responsável
              </span>
            </div>
            <h2 class="mt-2 text-lg font-semibold">{{ props.task.title }}</h2>
            <p class="mt-1 text-sm text-[rgb(var(--muted-foreground))]">
              {{ props.task.description }}
            </p>

            <div class="mt-3 flex flex-wrap items-center gap-1">
              <span
                v-for="label in taskTags"
                :key="label"
                class="rounded-md border border-[rgb(var(--border))] px-1.5 py-0.5 text-[10px] uppercase tracking-wide"
              >
                {{ label }}
              </span>
            </div>
          </div>
          <button
            class="panel-muted p-1.5"
            @click="emit('close')"
          >
            <X class="h-5 w-5" />
          </button>
        </header>

        <div class="grid grid-cols-4 gap-2 border-b border-[rgb(var(--border))] p-3 text-xs">
          <button
            class="panel-muted px-2 py-1.5"
            :class="{ 'bg-slate-500/20': activeTab === 'messages' }"
            @click="activeTab = 'messages'"
          >
            Messages ({{ props.messages.length }})
          </button>
          <button
            class="panel-muted px-2 py-1.5"
            :class="{ 'bg-slate-500/20': activeTab === 'activities' }"
            @click="activeTab = 'activities'"
          >
            Activities ({{ props.activities.length }})
          </button>
          <button
            class="panel-muted px-2 py-1.5"
            :class="{ 'bg-slate-500/20': activeTab === 'documents' }"
            @click="activeTab = 'documents'"
          >
            Documents ({{ props.documents.length }})
          </button>
          <button
            class="panel-muted px-2 py-1.5"
            :class="{ 'bg-slate-500/20': activeTab === 'notifications' }"
            @click="activeTab = 'notifications'"
          >
            Notifications ({{ props.notifications.length }})
          </button>
        </div>

        <div class="scroll-thin flex-1 overflow-y-auto p-4">
          <template v-if="activeTab === 'messages'">
            <article
              v-for="message in props.messages"
              :key="message.id"
              class="panel-muted mb-2 p-3"
            >
              <p
                class="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted-foreground))]"
              >
                {{ agentById[message.fromAgentId]?.name ?? "Agent" }}
              </p>
              <p class="mt-1 text-sm">{{ message.content }}</p>
              <p class="mt-1 text-xs text-[rgb(var(--muted-foreground))]">
                {{ message.timestampLabel }}
              </p>
            </article>
            <p
              v-if="props.messages.length === 0"
              class="text-sm text-[rgb(var(--muted-foreground))]"
            >
              Sem mensagens.
            </p>
          </template>

          <template v-else-if="activeTab === 'activities'">
            <article
              v-for="activity in props.activities"
              :key="activity.id"
              class="panel-muted mb-2 p-3"
            >
              <p class="text-sm">{{ activity.message }}</p>
              <p class="mt-1 text-xs text-[rgb(var(--muted-foreground))]">
                {{ activity.timestampLabel }}
              </p>
            </article>
            <p
              v-if="props.activities.length === 0"
              class="text-sm text-[rgb(var(--muted-foreground))]"
            >
              Sem atividades.
            </p>
          </template>

          <template v-else-if="activeTab === 'documents'">
            <article
              v-for="document in props.documents"
              :key="document.id"
              class="panel-muted mb-2 p-3"
            >
              <p class="text-sm font-semibold">{{ document.title }}</p>
              <p
                class="text-xs uppercase tracking-wide text-[rgb(var(--muted-foreground))]"
              >
                {{ document.type }}
              </p>
              <pre
                class="mt-2 overflow-x-auto whitespace-pre-wrap text-xs text-[rgb(var(--muted-foreground))]"
              >{{ document.content }}</pre
              >
            </article>
            <p
              v-if="props.documents.length === 0"
              class="text-sm text-[rgb(var(--muted-foreground))]"
            >
              Sem documentos.
            </p>
          </template>

          <template v-else>
            <article
              v-for="notification in props.notifications"
              :key="notification.id"
              class="panel-muted mb-2 p-3"
            >
              <p class="text-sm">{{ notification.content }}</p>
              <p
                class="mt-1 text-xs"
                :class="
                  notification.delivered ? 'text-emerald-500' : 'text-amber-500'
                "
              >
                {{ notification.delivered ? "Entregue" : "Pendente" }}
              </p>
            </article>
            <p
              v-if="props.notifications.length === 0"
              class="text-sm text-[rgb(var(--muted-foreground))]"
            >
              Sem notificações.
            </p>
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>
