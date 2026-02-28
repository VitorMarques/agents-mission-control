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
    class="panel sticky top-0 z-30 mx-2 mt-2 flex items-center justify-between gap-2 px-3 py-2 backdrop-blur lg:mx-3 lg:mt-3 lg:gap-4 lg:px-4 lg:py-3"
  >
    <div class="flex items-center gap-3">
      <div class="h-2 w-2 rounded-full bg-amber-500" />
      <div>
        <p
          class="text-xs uppercase tracking-[0.2em] text-[rgb(var(--muted-foreground))]"
        >
          Mission Control
        </p>
        <h1 class="text-sm font-semibold">{{ projectName }}</h1>
      </div>
    </div>

    <!-- Mobile stats indicator -->
    <div class="flex items-center gap-3 text-center lg:hidden">
      <div class="flex items-center gap-1">
        <span class="text-sm font-semibold">{{ props.activeAgents }}</span>
        <span class="text-[10px] text-[rgb(var(--muted-foreground))]">agentes</span>
      </div>
      <div class="flex items-center gap-1">
        <span class="text-sm font-semibold">{{ props.queuedTasks }}</span>
        <span class="text-[10px] text-[rgb(var(--muted-foreground))]">fila</span>
      </div>
      <div class="flex items-center gap-1">
        <span class="text-sm font-semibold">{{ props.reviewingTasks }}</span>
        <span class="text-[10px] text-[rgb(var(--muted-foreground))]">review</span>
      </div>
    </div>

    <!-- Desktop stats -->
    <div class="hidden items-center gap-6 text-center lg:flex">
      <div>
        <p class="text-lg font-semibold">{{ props.activeAgents }}</p>
        <p
          class="text-[10px] uppercase tracking-wide text-[rgb(var(--muted-foreground))]"
        >
          Agents active
        </p>
      </div>
      <div>
        <p class="text-lg font-semibold">{{ props.queuedTasks }}</p>
        <p
          class="text-[10px] uppercase tracking-wide text-[rgb(var(--muted-foreground))]"
        >
          Tasks in queue
        </p>
      </div>
      <div>
        <p class="text-lg font-semibold">{{ props.reviewingTasks }}</p>
        <p
          class="text-[10px] uppercase tracking-wide text-[rgb(var(--muted-foreground))]"
        >
          In review
        </p>
      </div>
    </div>

    <div class="flex items-center gap-2 lg:gap-3">
      <!-- Mobile: Compact buttons -->
      <div class="flex items-center gap-1 lg:gap-2">
        <button
          class="panel-muted p-2 text-xs font-medium lg:px-3 lg:py-1.5"
          type="button"
          @click="toggleTheme"
          :title="isDark ? 'Light mode' : 'Dark mode'"
        >
          <svg
            v-if="isDark"
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 lg:h-auto lg:w-auto"
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
            class="h-4 w-4 lg:h-auto lg:w-auto"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </button>
        <button
          class="panel-muted p-2 text-xs font-medium lg:px-3 lg:py-1.5"
          type="button"
          @click="emit('logout')"
          title="Logout"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 lg:h-auto lg:w-auto"
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

      <div class="hidden items-center gap-2 sm:flex">
        <div class="text-center">
          <p class="text-lg font-semibold leading-none">{{ timeLabel }}</p>
          <p
            class="mt-1 text-[10px] uppercase tracking-wide text-[rgb(var(--muted-foreground))]"
          >
            {{ dateLabel }}
          </p>
        </div>
        <span
          class="rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.2em]"
          :class="statusClass"
        >
          {{ statusLabel }}
        </span>
      </div>
    </div>
  </header>
</template>
