<script setup lang="ts">
import type { Agent } from "~/types/mission";

const props = defineProps<{
  agents: Agent[];
}>();
</script>

<template>
  <aside
    class="panel scroll-thin flex h-[calc(100vh-6.5rem)] min-w-[250px] flex-col overflow-y-auto p-3"
  >
    <div class="mb-3 flex items-center justify-between">
      <h2
        class="text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--muted-foreground))]"
      >
        Agents
      </h2>
      <span
        class="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-700/40 dark:text-slate-300"
        >{{ props.agents.length }}</span
      >
    </div>

    <ul class="space-y-2">
      <li
        v-for="agent in props.agents"
        :key="agent.id"
        class="panel-muted flex items-center justify-between gap-3 p-2"
      >
        <div class="flex min-w-0 items-center gap-2">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgb(var(--border))] bg-white/60 text-lg shadow-sm dark:bg-slate-900/40"
          >
            {{ agent.avatarEmoji }}
          </div>
          <div class="min-w-0">
            <p class="truncate text-sm font-medium">{{ agent.name }}</p>
            <p class="text-xs text-[rgb(var(--muted-foreground))]">
              {{ agent.role }}
            </p>
          </div>
        </div>
        <StatusBadge :status="agent.status" />
      </li>
    </ul>
  </aside>
</template>
