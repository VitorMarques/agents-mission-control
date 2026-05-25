<script setup lang="ts">
import { ref } from "vue";
import { X } from "lucide-vue-next";

const props = defineProps<{
  agents: Array<{
    id: string;
    name: string;
    avatarEmoji: string;
  }>;
}>();

const emit = defineEmits<{
  close: [];
  created: [];
}>();

const title = ref("");
const description = ref("");
const priority = ref<"low" | "medium" | "high" | "critical">("medium");
const selectedAssigneeIds = ref<string[]>([]);
const tags = ref("");
const isSubmitting = ref(false);
const error = ref("");

function toggleAssignee(agentId: string) {
  const idx = selectedAssigneeIds.value.indexOf(agentId);
  if (idx >= 0) {
    selectedAssigneeIds.value.splice(idx, 1);
  } else {
    selectedAssigneeIds.value.push(agentId);
  }
}

async function submit() {
  if (!title.value.trim()) return;

  isSubmitting.value = true;
  error.value = "";

  try {
    const res = await $fetch("/api/tasks", {
      method: "POST",
      body: {
        title: title.value.trim(),
        description: description.value.trim(),
        priority: priority.value,
        assigneeIds: selectedAssigneeIds.value,
        tags: tags.value
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      },
    });

    if (res) {
      title.value = "";
      description.value = "";
      priority.value = "medium";
      selectedAssigneeIds.value = [];
      tags.value = "";
      emit("created");
    }
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || "Erro ao criar tarefa";
  } finally {
    isSubmitting.value = false;
  }
}

function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) emit("close");
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click="handleBackdropClick"
    >
      <div class="panel flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden">
        <header class="flex items-center justify-between border-b border-[rgb(var(--border))] p-4">
          <h2 class="text-lg font-semibold">New Task</h2>
          <button class="panel-muted p-1.5" @click="emit('close')">
            <X class="h-5 w-5" />
          </button>
        </header>

        <div class="scroll-thin flex-1 overflow-y-auto p-4 space-y-4">
          <!-- Title -->
          <div>
            <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-[rgb(var(--muted-foreground))]">Title *</label>
            <input
              v-model="title"
              class="w-full rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="What needs to be done?"
              @keydown.enter="submit"
            />
          </div>

          <!-- Description -->
          <div>
            <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-[rgb(var(--muted-foreground))]">Description</label>
            <textarea
              v-model="description"
              class="w-full rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-amber-500"
              rows="3"
              placeholder="Details, context, acceptance criteria..."
            />
          </div>

          <!-- Priority -->
          <div>
            <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-[rgb(var(--muted-foreground))]">Priority</label>
            <div class="flex gap-2">
              <button
                v-for="p in (['low', 'medium', 'high', 'critical'] as const)"
                :key="p"
                class="rounded-md px-3 py-1.5 text-xs font-medium capitalize transition"
                :class="priority === p
                  ? 'bg-amber-500 text-white'
                  : 'border border-[rgb(var(--border))] text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))]'"
                @click="priority = p"
              >{{ p }}</button>
            </div>
          </div>

          <!-- Assignees -->
          <div>
            <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-[rgb(var(--muted-foreground))]">Assignees</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="agent in props.agents"
                :key="agent.id"
                class="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition"
                :class="selectedAssigneeIds.includes(agent.id)
                  ? 'bg-amber-500/20 text-amber-600 border border-amber-500/30'
                  : 'border border-[rgb(var(--border))] text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))]'"
                @click="toggleAssignee(agent.id)"
              >
                <span>{{ agent.avatarEmoji }}</span>
                <span>{{ agent.name }}</span>
              </button>
            </div>
          </div>

          <!-- Tags -->
          <div>
            <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-[rgb(var(--muted-foreground))]">Tags (comma separated)</label>
            <input
              v-model="tags"
              class="w-full rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="seo, urgent, bug"
            />
          </div>

          <!-- Error -->
          <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
        </div>

        <!-- Footer -->
        <footer class="flex justify-end gap-2 border-t border-[rgb(var(--border))] p-4">
          <button
            class="rounded-md px-4 py-2 text-xs font-medium text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))]"
            @click="emit('close')"
          >Cancel</button>
          <button
            class="rounded-md bg-amber-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50"
            :disabled="!title.trim() || isSubmitting"
            @click="submit"
          >{{ isSubmitting ? 'Creating...' : 'Create Task' }}</button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>
