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

const props = defineProps<{
  task: Task | null;
  agents: Agent[];
  messages: TaskMessage[];
  activities: TaskActivity[];
  documents: TaskDocument[];
  notifications: TaskNotification[];
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
</script>

<template>
  <aside
    class="panel scroll-thin hidden h-[calc(100vh-6.5rem)] w-[360px] min-w-[360px] flex-col overflow-y-auto p-3 2xl:flex"
  >
    <template v-if="props.task">
      <p
        class="text-xs uppercase tracking-[0.18em] text-[rgb(var(--muted-foreground))]"
      >
        Task Detail
      </p>
      <h2 class="mt-1 text-base font-semibold">{{ props.task.title }}</h2>
      <p class="mt-1 text-sm text-[rgb(var(--muted-foreground))]">
        {{ props.task.description }}
      </p>

      <div class="mt-3 flex flex-wrap gap-1">
        <span
          v-for="label in props.task.labels"
          :key="label"
          class="rounded-md border border-[rgb(var(--border))] px-1.5 py-0.5 text-[10px] uppercase tracking-wide"
        >
          {{ label }}
        </span>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-2 text-xs">
        <button class="panel-muted px-2 py-1.5" @click="activeTab = 'messages'">
          Messages ({{ props.messages.length }})
        </button>
        <button
          class="panel-muted px-2 py-1.5"
          @click="activeTab = 'activities'"
        >
          Activities ({{ props.activities.length }})
        </button>
        <button
          class="panel-muted px-2 py-1.5"
          @click="activeTab = 'documents'"
        >
          Documents ({{ props.documents.length }})
        </button>
        <button
          class="panel-muted px-2 py-1.5"
          @click="activeTab = 'notifications'"
        >
          Notifications ({{ props.notifications.length }})
        </button>
      </div>

      <div class="mt-3 space-y-2">
        <template v-if="activeTab === 'messages'">
          <article
            v-for="message in props.messages"
            :key="message.id"
            class="panel-muted p-2"
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
            class="panel-muted p-2"
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
            class="panel-muted p-2"
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
            class="panel-muted p-2"
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
    </template>

    <template v-else>
      <div
        class="panel-muted flex h-full items-center justify-center p-4 text-center text-sm text-[rgb(var(--muted-foreground))]"
      >
        Selecione uma task no board para ver mensagens, atividades, documentos e
        notificações.
      </div>
    </template>
  </aside>
</template>
