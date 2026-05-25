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
  messagePosted: [];
  documentCreated: [];
}>();

const activeTab = ref<
  "messages" | "activities" | "documents" | "notifications"
>("messages");

// ─── Message form ──────────────────────────────────────────────────────
const newMessage = ref("");
const isSendingMessage = ref(false);

// ─── Document form ─────────────────────────────────────────────────────
const showDocForm = ref(false);
const newDocTitle = ref("");
const newDocContent = ref("");
const newDocType = ref<"deliverable" | "research" | "protocol" | "report" | "audit">("deliverable");
const isCreatingDoc = ref(false);

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
    newMessage.value = "";
    showDocForm.value = false;
  },
);

const taskTags = computed(() => {
  if (!props.task) return [] as string[];
  return props.task.tags.length > 0 ? props.task.tags : props.task.labels;
});

const assigneeAgent = computed(() => {
  if (!props.task || !props.task.assigneeIds.length) return null;
  const assigneeId = props.task.assigneeIds[0];
  return assigneeId ? (agentById.value[assigneeId] ?? null) : null;
});

const priorityColor = computed(() => {
  if (!props.task) return "bg-slate-200 text-slate-600";
  switch (props.task.priority) {
    case "critical": return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300";
    case "high": return "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300";
    case "medium": return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300";
    case "low": return "bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300";
    default: return "bg-slate-200 text-slate-600";
  }
});

function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) emit("close");
}

async function postMessage() {
  if (!newMessage.value.trim() || !props.task) return;
  isSendingMessage.value = true;
  try {
    await $fetch(`/api/tasks/${props.task.id}/messages`, {
      method: "POST",
      body: { content: newMessage.value.trim() },
    });
    newMessage.value = "";
    emit("messagePosted");
  } catch (err) {
    console.error("Failed to post message", err);
  } finally {
    isSendingMessage.value = false;
  }
}

async function createDocument() {
  if (!newDocTitle.value.trim() || !props.task) return;
  isCreatingDoc.value = true;
  try {
    await $fetch(`/api/tasks/${props.task.id}/documents`, {
      method: "POST",
      body: {
        title: newDocTitle.value.trim(),
        content: newDocContent.value,
        type: newDocType.value,
      },
    });
    newDocTitle.value = "";
    newDocContent.value = "";
    showDocForm.value = false;
    emit("documentCreated");
  } catch (err) {
    console.error("Failed to create document", err);
  } finally {
    isCreatingDoc.value = false;
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
      <div class="panel flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden">
        <header class="flex items-start justify-between border-b border-[rgb(var(--border))] p-4">
          <div class="flex-1 pr-4">
            <div class="flex items-center gap-2">
              <p class="text-xs uppercase tracking-[0.18em] text-[rgb(var(--muted-foreground))]">Task Detail</p>
              <span class="text-[rgb(var(--muted-foreground))]">|</span>
              <span
                v-if="assigneeAgent"
                class="rounded-md bg-amber-500 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white"
              >👤 {{ assigneeAgent.name }}</span>
              <span v-else class="rounded-md bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600">👤 Sem responsável</span>
              <span
                class="rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide"
                :class="priorityColor"
              >{{ props.task.priority }}</span>
            </div>
            <h2 class="mt-2 text-lg font-semibold">{{ props.task.title }}</h2>
            <p class="mt-1 text-sm text-[rgb(var(--muted-foreground))]">{{ props.task.description }}</p>
            <div class="mt-3 flex flex-wrap items-center gap-1">
              <span
                v-for="label in taskTags"
                :key="label"
                class="rounded-md border border-[rgb(var(--border))] px-1.5 py-0.5 text-[10px] uppercase tracking-wide"
              >{{ label }}</span>
            </div>
          </div>
          <button class="panel-muted p-1.5" @click="emit('close')">
            <X class="h-5 w-5" />
          </button>
        </header>

        <div class="grid grid-cols-4 gap-2 border-b border-[rgb(var(--border))] p-3 text-xs">
          <button
            class="panel-muted px-2 py-1.5"
            :class="{ 'bg-slate-500/20': activeTab === 'messages' }"
            @click="activeTab = 'messages'"
          >Messages ({{ props.messages.length }})</button>
          <button
            class="panel-muted px-2 py-1.5"
            :class="{ 'bg-slate-500/20': activeTab === 'activities' }"
            @click="activeTab = 'activities'"
          >Activities ({{ props.activities.length }})</button>
          <button
            class="panel-muted px-2 py-1.5"
            :class="{ 'bg-slate-500/20': activeTab === 'documents' }"
            @click="activeTab = 'documents'"
          >Documents ({{ props.documents.length }})</button>
          <button
            class="panel-muted px-2 py-1.5"
            :class="{ 'bg-slate-500/20': activeTab === 'notifications' }"
            @click="activeTab = 'notifications'"
          >Notifications ({{ props.notifications.length }})</button>
        </div>

        <div class="scroll-thin flex-1 overflow-y-auto p-4">
          <!-- Messages Tab -->
          <template v-if="activeTab === 'messages'">
            <article
              v-for="message in props.messages"
              :key="message.id"
              class="panel-muted mb-2 p-3"
              :class="message.type === 'decision' ? 'border-l-2 border-l-amber-500' : ''"
            >
              <div class="flex items-center gap-2">
                <p class="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted-foreground))]">
                  {{ agentById[message.fromAgentId ?? '']?.name ?? message.fromAgentId ?? "User" }}
                </p>
                <span v-if="message.type === 'decision'" class="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-700">Decision</span>
              </div>
              <p class="mt-1 text-sm whitespace-pre-wrap">{{ message.content }}</p>
              <p class="mt-1 text-xs text-[rgb(var(--muted-foreground))]">{{ message.timestampLabel }}</p>
            </article>
            <p v-if="props.messages.length === 0" class="text-sm text-[rgb(var(--muted-foreground))]">Sem mensagens.</p>

            <!-- New message form -->
            <div class="mt-3 border-t border-[rgb(var(--border))] pt-3">
              <textarea
                v-model="newMessage"
                class="w-full rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-amber-500"
                rows="2"
                placeholder="Post a comment... Use @AgentName to mention"
                @keydown.ctrl.enter="postMessage"
                @keydown.meta.enter="postMessage"
              />
              <div class="mt-1 flex justify-end">
                <button
                  class="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50"
                  :disabled="!newMessage.trim() || isSendingMessage"
                  @click="postMessage"
                >{{ isSendingMessage ? 'Sending...' : 'Send (⌘↵)' }}</button>
              </div>
            </div>
          </template>

          <!-- Activities Tab -->
          <template v-else-if="activeTab === 'activities'">
            <article v-for="activity in props.activities" :key="activity.id" class="panel-muted mb-2 p-3">
              <p class="text-sm">{{ activity.message }}</p>
              <p class="mt-1 text-xs text-[rgb(var(--muted-foreground))]">{{ activity.timestampLabel }}</p>
            </article>
            <p v-if="props.activities.length === 0" class="text-sm text-[rgb(var(--muted-foreground))]">Sem atividades.</p>
          </template>

          <!-- Documents Tab -->
          <template v-else-if="activeTab === 'documents'">
            <div class="mb-3 flex justify-end">
              <button
                class="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-600"
                @click="showDocForm = !showDocForm"
              >{{ showDocForm ? 'Cancel' : '+ New Document' }}</button>
            </div>

            <div v-if="showDocForm" class="panel-muted mb-3 p-3 space-y-2">
              <input
                v-model="newDocTitle"
                class="w-full rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="Document title"
              />
              <select
                v-model="newDocType"
                class="w-full rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="deliverable">Deliverable</option>
                <option value="research">Research</option>
                <option value="protocol">Protocol</option>
                <option value="report">Report</option>
                <option value="audit">Audit</option>
              </select>
              <textarea
                v-model="newDocContent"
                class="w-full rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-amber-500"
                rows="6"
                placeholder="Document content (markdown)"
              />
              <div class="flex justify-end">
                <button
                  class="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50"
                  :disabled="!newDocTitle.trim() || isCreatingDoc"
                  @click="createDocument"
                >{{ isCreatingDoc ? 'Creating...' : 'Create' }}</button>
              </div>
            </div>

            <article v-for="document in props.documents" :key="document.id" class="panel-muted mb-2 p-3">
              <div class="flex items-center gap-2">
                <p class="text-sm font-semibold">{{ document.title }}</p>
                <span class="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-[rgb(var(--muted-foreground))]">{{ document.type }}</span>
              </div>
              <pre class="mt-2 overflow-x-auto whitespace-pre-wrap text-xs text-[rgb(var(--muted-foreground))]">{{ document.content }}</pre>
            </article>
            <p v-if="props.documents.length === 0 && !showDocForm" class="text-sm text-[rgb(var(--muted-foreground))]">Sem documentos.</p>
          </template>

          <!-- Notifications Tab -->
          <template v-else>
            <article v-for="notification in props.notifications" :key="notification.id" class="panel-muted mb-2 p-3">
              <p class="text-sm">{{ notification.content }}</p>
              <p class="mt-1 text-xs" :class="notification.delivered ? 'text-emerald-500' : 'text-amber-500'">
                {{ notification.delivered ? "Entregue" : "Pendente" }}
              </p>
            </article>
            <p v-if="props.notifications.length === 0" class="text-sm text-[rgb(var(--muted-foreground))]">Sem notificações.</p>
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>
