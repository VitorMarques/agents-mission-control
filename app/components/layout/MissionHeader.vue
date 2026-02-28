<script setup lang="ts">
const props = defineProps<{
  activeAgents: number;
  queuedTasks: number;
  reviewingTasks: number;
  missionStatus: "online" | "loading" | "degraded";
}>();

const emit = defineEmits<{
  logout: [];
}>();

const isDark = useState<boolean>("theme-dark", () => false);
const runtimeConfig = useRuntimeConfig();
const now = ref(new Date());

const projectName = computed(() => {
  return runtimeConfig.public.appName ?? "Mission Dashboard";
});

const docsUrl = computed(() => String(runtimeConfig.public.docsUrl ?? "#"));

const timeLabel = computed(() =>
  now.value.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }),
);

const dateLabel = computed(() =>
  now.value.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }),
);

const statusLabel = computed(() => {
  if (props.missionStatus === "loading") {
    return "SYNCING";
  }
  if (props.missionStatus === "degraded") {
    return "DEGRADED";
  }
  return "ONLINE";
});

const statusClass = computed(() => {
  if (props.missionStatus === "loading") {
    return "text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-500/20";
  }
  if (props.missionStatus === "degraded") {
    return "text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-500/20";
  }
  return "text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-500/20";
});

let clockInterval: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  clockInterval = setInterval(() => {
    now.value = new Date();
  }, 1000);
});

onBeforeUnmount(() => {
  if (clockInterval) {
    clearInterval(clockInterval);
    clockInterval = null;
  }
});

function toggleTheme() {
  isDark.value = !isDark.value;
}

watchEffect(() => {
  if (import.meta.client) {
    document.documentElement.classList.toggle("dark", isDark.value);
  }
});
</script>

<template>
  <header
    class="panel sticky top-0 z-30 mx-2 mt-2 flex items-center justify-between gap-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))]/95 px-3 py-2 backdrop-blur lg:mx-3 lg:mt-3 lg:gap-4 lg:px-4 lg:py-3"
  >
    <!-- Logo & Title -->
    <div class="flex items-center gap-3">
      <div class="relative">
        <div class="h-3 w-3 rounded-full bg-amber-500 animate-pulse"></div>
        <div class="absolute -inset-1 rounded-full bg-amber-500/30 animate-ping"></div>
      </div>
      <div class="min-w-0">
        <p
          class="truncate text-[10px] font-medium uppercase tracking-[0.2em] text-[rgb(var(--muted-foreground))]"
        >
          Mission Control
        </p>
        <h1 class="truncate text-sm font-bold">{{ projectName }}</h1>
      </div>
    </div>

    <!-- Stats - Desktop with icons -->
    <div class="hidden items-center gap-1 lg:flex">
      <!-- Active Agents -->
      <div class="flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-3 py-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        <span class="text-sm font-bold text-emerald-600 dark:text-emerald-400">{{ props.activeAgents }}</span>
        <span class="text-[10px] text-emerald-600/70 dark:text-emerald-400/70">agents</span>
      </div>

      <!-- Queue -->
      <div class="flex items-center gap-1.5 rounded-md bg-amber-500/10 px-3 py-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="9" y1="9" x2="15" y2="9"></line>
          <line x1="9" y1="13" x2="15" y2="13"></line>
          <line x1="9" y1="17" x2="12" y2="17"></line>
        </svg>
        <span class="text-sm font-bold text-amber-600 dark:text-amber-400">{{ props.queuedTasks }}</span>
        <span class="text-[10px] text-amber-600/70 dark:text-amber-400/70">queue</span>
      </div>

      <!-- Review -->
      <div class="flex items-center gap-1.5 rounded-md bg-violet-500/10 px-3 py-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        <span class="text-sm font-bold text-violet-600 dark:text-violet-400">{{ props.reviewingTasks }}</span>
        <span class="text-[10px] text-violet-600/70 dark:text-violet-400/70">review</span>
      </div>
    </div>

    <!-- Mobile Stats - Compact -->
    <div class="flex items-center gap-2 lg:hidden">
      <div class="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1">
        <span class="text-xs font-bold text-emerald-600">{{ props.activeAgents }}</span>
      </div>
      <div class="flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-1">
        <span class="text-xs font-bold text-amber-600">{{ props.queuedTasks }}</span>
      </div>
      <div class="flex items-center gap-1 rounded-md bg-violet-500/10 px-2 py-1">
        <span class="text-xs font-bold text-violet-600">{{ props.reviewingTasks }}</span>
      </div>
    </div>

    <!-- Right side actions -->
    <div class="flex items-center gap-2">
      <!-- Time & Status - Desktop -->
      <div class="hidden items-center gap-2 lg:flex">
        <div class="flex flex-col items-end">
          <span class="font-mono text-sm font-semibold tabular-nums">{{ timeLabel }}</span>
          <span class="text-[10px] text-[rgb(var(--muted-foreground))]">{{ dateLabel }}</span>
        </div>
        <span
          class="flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold tracking-wider"
          :class="statusClass"
        >
          <span class="h-1.5 w-1.5 rounded-full currentColor animate-pulse"></span>
          {{ statusLabel }}
        </span>
      </div>

      <!-- Mobile: compact status -->
      <div class="flex items-center gap-1 lg:hidden">
        <span
          class="h-2 w-2 rounded-full"
          :class="props.missionStatus === 'online' ? 'bg-emerald-500' : props.missionStatus === 'loading' ? 'bg-amber-500' : 'bg-rose-500'"
        ></span>
      </div>

      <!-- Divider -->
      <div class="hidden h-6 w-px bg-[rgb(var(--border))] lg:block"></div>

      <!-- Actions -->
      <div class="flex items-center gap-1">
        <!-- Docs - Desktop -->
        <a
          class="hidden rounded-md p-2 text-[rgb(var(--muted-foreground))] transition-colors hover:bg-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] lg:block"
          :href="docsUrl"
          target="_blank"
          rel="noreferrer"
          title="Documentation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
        </a>

        <!-- Theme Toggle -->
        <button
          class="rounded-md p-2 text-[rgb(var(--muted-foreground))] transition-colors hover:bg-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]"
          type="button"
          @click="toggleTheme"
          :title="isDark ? 'Light mode' : 'Dark mode'"
        >
          <svg
            v-if="isDark"
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </button>

        <!-- Logout -->
        <button
          class="rounded-md p-2 text-[rgb(var(--muted-foreground))] transition-colors hover:bg-rose-500/10 hover:text-rose-500"
          type="button"
          @click="emit('logout')"
          title="Logout"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>
