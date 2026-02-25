<script setup lang="ts">
import type { Task, TaskStatus } from "~/types/mission";
import { computed } from "vue";

type Column = {
  status: TaskStatus;
  label: string;
};

const props = defineProps<{
  tasks: Task[];
  columns: Column[];
}>();

const emit = defineEmits<{
  selectTask: [task: Task];
}>();

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
</script>

<template>
  <section
    class="panel scroll-thin flex h-[calc(100vh-6.5rem)] flex-1 gap-3 overflow-x-auto p-3"
  >
    <article
      v-for="column in props.columns"
      :key="column.status"
      class="panel-muted flex w-[280px] min-w-[280px] flex-col p-2"
    >
      <header class="mb-2 flex items-center justify-between px-1">
        <h3
          class="text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--muted-foreground))]"
        >
          {{ column.label }}
        </h3>
        <span
          class="rounded-md bg-slate-200 px-1.5 py-0.5 text-xs dark:bg-slate-700/50"
        >
          {{ tasksForStatus(column.status).length }}
        </span>
      </header>

      <div class="space-y-2 overflow-y-auto">
        <div
          v-for="task in tasksForStatus(column.status)"
          :key="task.id"
          class="panel cursor-pointer border-l-2 border-l-amber-500 p-3 transition hover:translate-x-0.5 hover:border-l-emerald-400"
          role="button"
          tabindex="0"
          @click="emit('selectTask', task)"
        >
          <h4 class="text-sm font-semibold leading-tight">{{ task.title }}</h4>
          <p
            class="mt-1 line-clamp-2 text-xs text-[rgb(var(--muted-foreground))]"
          >
            {{ task.description }}
          </p>
          <div class="mt-2 flex flex-wrap gap-1">
            <span
              v-for="label in task.labels"
              :key="label"
              class="rounded-md border border-[rgb(var(--border))] px-1.5 py-0.5 text-[10px] uppercase tracking-wide"
            >
              {{ label }}
            </span>
          </div>
        </div>
      </div>
    </article>
  </section>
</template>
