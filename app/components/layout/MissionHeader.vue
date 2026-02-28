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
    class="panel sticky top-0 z-30 mx-3 mt-3 flex items-center justify-between gap-4 px-4 py-3 backdrop-blur"
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

    <div class="hidden items-center gap-6 text-center sm:flex">
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

    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2">
        <a
          class="panel-muted px-3 py-1.5 text-xs font-medium"
          :href="docsUrl"
          target="_blank"
          rel="noreferrer"
        >
          📚 Docs
        </a>
        <button
          class="panel-muted px-3 py-1.5 text-xs font-medium"
          type="button"
          @click="toggleTheme"
        >
          {{ isDark ? "Light" : "Dark" }}
        </button>
        <button
          class="panel-muted px-3 py-1.5 text-xs font-medium"
          type="button"
          @click="emit('logout')"
        >
          Logout
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
