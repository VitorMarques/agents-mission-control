<script setup lang="ts">
import type { Agent, Task, TaskStatus } from "~/types/mission";
import { computed, ref } from "vue";

type Column = {
  status: TaskStatus;
  label: string;
};

const props = defineProps<{
  tasks: Task[];
  columns: Column[];
  agents: Agent[];
  canMoveStatus?: boolean;
}>();

const emit = defineEmits<{
  selectTask: [task: Task];
  moveTaskStatus: [payload: { taskId: string; status: TaskStatus }];
}>();

const draggingTaskId = ref<string | null>(null);
const dropTargetStatus = ref<TaskStatus | null>(null);

const tasksByStatus = computed<Record<TaskStatus, Task[]>>(() => {
  return props.tasks.reduce<Record<TaskStatus, Task[]>>(
    (acc, task) => {
      acc[task.status].push(task);
      return acc;
    },
    {
      inbox: [],
      assigned: [],
      in_progress: [],
      review: [],
      done: [],
    },
  );
});

function tasksForStatus(status: TaskStatus) {
  return tasksByStatus.value[status] ?? [];
}

const agentById = computed<Record<string, Agent>>(() => {
  return props.agents.reduce<Record<string, Agent>>((acc, agent) => {
    acc[agent.id] = agent;
    return acc;
  }, {});
});

const statusTheme: Record<
  TaskStatus,
  { column: string; card: string; hover: string; chip: string }
> = {
  inbox: {
    column: "border-t-2 border-t-slate-400/70",
    card: "border-l-slate-400",
    hover: "hover:border-l-slate-500",
    chip: "bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300",
  },
  assigned: {
    column: "border-t-2 border-t-amber-400/70",
    card: "border-l-amber-500",
    hover: "hover:border-l-amber-400",
    chip: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  },
  in_progress: {
    column: "border-t-2 border-t-emerald-400/70",
    card: "border-l-emerald-500",
    hover: "hover:border-l-emerald-400",
    chip: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  },
  review: {
    column: "border-t-2 border-t-sky-400/70",
    card: "border-l-sky-500",
    hover: "hover:border-l-sky-400",
    chip: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
  },
  done: {
    column: "border-t-2 border-t-violet-400/70",
    card: "border-l-violet-500",
    hover: "hover:border-l-violet-400",
    chip: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
  },
};

function themeForStatus(status: TaskStatus) {
  return statusTheme[status] ?? statusTheme.inbox;
}

function assigneeName(task: Task) {
  const firstAssigneeId = task.assigneeIds[0];
  if (!firstAssigneeId) {
    return "Sem responsável";
  }
  return agentById.value[firstAssigneeId]?.name ?? "Agente";
}

function taskAgeLabel(task: Task) {
  const diffMs = Math.max(0, Date.now() - task.createdAt);
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 24) {
    return `há ${Math.max(1, hours)}h`;
  }
  const days = Math.floor(hours / 24);
  return `há ${Math.max(1, days)}d`;
}

function displayTags(task: Task) {
  if (task.tags.length > 0) {
    return task.tags;
  }
  return task.labels;
}

function onDragStart(task: Task) {
  if (!props.canMoveStatus) {
    return;
  }
  draggingTaskId.value = task.id;
}

function onDragEnd() {
  draggingTaskId.value = null;
  dropTargetStatus.value = null;
}

function onColumnDragOver(status: TaskStatus) {
  if (!draggingTaskId.value || !props.canMoveStatus) {
    return;
  }
  dropTargetStatus.value = status;
}

function onColumnDragLeave(event: DragEvent, status: TaskStatus) {
  if (dropTargetStatus.value !== status) {
    return;
  }

  const currentTarget = event.currentTarget as HTMLElement | null;
  const relatedTarget = event.relatedTarget as Node | null;
  if (currentTarget && relatedTarget && currentTarget.contains(relatedTarget)) {
    return;
  }

  dropTargetStatus.value = null;
}

function onDropToStatus(status: TaskStatus) {
  if (!draggingTaskId.value || !props.canMoveStatus) {
    return;
  }
  emit("moveTaskStatus", { taskId: draggingTaskId.value, status });
  draggingTaskId.value = null;
  dropTargetStatus.value = null;
}
</script>

<template>
  <section
    class="panel scroll-thin flex h-[calc(100vh-5rem)] flex-1 gap-2 overflow-x-auto p-2 lg:h-[calc(100vh-6.5rem)] lg:gap-3 lg:p-3"
  >
    <article
      v-for="column in props.columns"
      :key="column.status"
      class="panel-muted flex w-[260px] min-w-[260px] flex-col p-2 lg:w-[280px] lg:min-w-[280px]"
      :class="themeForStatus(column.status).column"
      @dragover.prevent="onColumnDragOver(column.status)"
      @dragleave="onColumnDragLeave($event, column.status)"
      @drop="onDropToStatus(column.status)"
    >
      <header class="mb-2 flex items-center justify-between px-1">
        <h3
          class="text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--muted-foreground))]"
        >
          {{ column.label }}
        </h3>
        <span
          class="rounded-md px-1.5 py-0.5 text-xs"
          :class="themeForStatus(column.status).chip"
        >
          {{ tasksForStatus(column.status).length }}
        </span>
      </header>

      <div class="space-y-2 overflow-y-auto">
        <div
          v-if="dropTargetStatus === column.status && draggingTaskId"
          class="rounded-md border border-dashed border-amber-400/80 bg-amber-100/40 px-3 py-2 text-xs font-medium text-amber-700 transition-all animate-pulse dark:bg-amber-500/10 dark:text-amber-300"
        >
          Solte aqui para mover para {{ column.label }}
        </div>
        <div
          v-for="task in tasksForStatus(column.status)"
          :key="task.id"
          class="panel cursor-pointer border-l-2 p-3 transition hover:translate-x-0.5"
          :class="[
            themeForStatus(column.status).card,
            themeForStatus(column.status).hover,
          ]"
          role="button"
          tabindex="0"
          :draggable="Boolean(props.canMoveStatus)"
          @click="emit('selectTask', task)"
          @dragstart="onDragStart(task)"
          @dragend="onDragEnd"
        >
          <h4 class="text-sm font-semibold leading-tight">{{ task.title }}</h4>
          <p
            class="mt-1 line-clamp-2 text-xs text-[rgb(var(--muted-foreground))]"
          >
            {{ task.description }}
          </p>
          <div class="mt-2 flex items-center justify-between gap-2 text-[11px]">
            <span class="text-[rgb(var(--muted-foreground))]">
              👤 {{ assigneeName(task) }}
            </span>
            <span class="text-[rgb(var(--muted-foreground))]">
              {{ taskAgeLabel(task) }}
            </span>
          </div>
          <div class="mt-2 flex flex-wrap gap-1">
            <span
              v-for="tag in displayTags(task)"
              :key="tag"
              class="rounded-md border border-[rgb(var(--border))] px-1.5 py-0.5 text-[10px] uppercase tracking-wide"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </article>
  </section>
</template>
