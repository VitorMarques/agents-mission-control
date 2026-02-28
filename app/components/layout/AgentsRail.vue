<script setup lang="ts">
import type { Agent } from "~/types/mission";
import { ref } from "vue";

const props = defineProps<{
  agents: Agent[];
}>();

const isOpen = ref(false);

function toggleOpen() {
  isOpen.value = !isOpen.value;
}
</script>

<template>
  <!-- Mobile: Floating button to open agents drawer -->
  <button
    class="fixed bottom-6 left-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-slate-700 shadow-lg transition-all hover:bg-slate-800 hover:scale-105 active:scale-95 lg:hidden"
    @click="toggleOpen"
    aria-label="Toggle Agents"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-5 text-white transition-transform"
      :class="isOpen ? 'rotate-180' : ''"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  </button>

  <!-- Desktop: Always visible sidebar -->
  <aside
    class="panel scroll-thin hidden lg:flex lg:h-[calc(100vh-6.5rem)] lg:min-w-[250px] lg:flex-col lg:overflow-y-auto lg:p-3"
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

  <!-- Mobile: Drawer overlay -->
  <Teleport to="body">
    <Transition name="drawer-fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-40 lg:hidden"
        @click="toggleOpen"
      >
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      </div>
    </Transition>

    <Transition name="drawer-slide">
      <aside
        v-if="isOpen"
        class="panel scroll-thin fixed bottom-20 left-2 z-50 w-[calc(100vw-1rem)] max-h-[60vh] overflow-y-auto rounded-lg bg-[rgb(var(--panel))] p-4 shadow-xl lg:hidden"
      >
        <div class="mb-4 flex items-center justify-between">
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
            class="panel-muted flex items-center justify-between gap-3 p-3"
          >
            <div class="flex min-w-0 items-center gap-3">
              <div
                class="flex h-12 w-12 items-center justify-center rounded-xl border border-[rgb(var(--border))] bg-white/60 text-xl shadow-sm dark:bg-slate-900/40"
              >
                {{ agent.avatarEmoji }}
              </div>
              <div class="min-w-0">
                <p class="truncate text-base font-medium">{{ agent.name }}</p>
                <p class="text-sm text-[rgb(var(--muted-foreground))]">
                  {{ agent.role }}
                </p>
              </div>
            </div>
            <StatusBadge :status="agent.status" />
          </li>
        </ul>
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 200ms ease;
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: all 250ms ease-out;
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  opacity: 0;
  transform: translateY(16px);
}
</style>
