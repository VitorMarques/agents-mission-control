<script setup lang="ts">
const props = defineProps<{
  activeAgents: number
  queuedTasks: number
  reviewingTasks: number
}>()

const isDark = useState<boolean>('theme-dark', () => false)

function toggleTheme() {
  isDark.value = !isDark.value
}

watchEffect(() => {
  if (import.meta.client) {
    document.documentElement.classList.toggle('dark', isDark.value)
  }
})
</script>

<template>
  <header class="panel sticky top-0 z-30 mx-3 mt-3 flex items-center justify-between gap-4 px-4 py-3 backdrop-blur">
    <div class="flex items-center gap-3">
      <div class="h-2 w-2 rounded-full bg-amber-500" />
      <div>
        <p class="text-xs uppercase tracking-[0.2em] text-[rgb(var(--muted-foreground))]">Mission Control</p>
        <h1 class="text-sm font-semibold">Agents Mission Dashboard</h1>
      </div>
    </div>

    <div class="hidden items-center gap-6 text-center sm:flex">
      <div>
        <p class="text-lg font-semibold">{{ props.activeAgents }}</p>
        <p class="text-[10px] uppercase tracking-wide text-[rgb(var(--muted-foreground))]">Agents active</p>
      </div>
      <div>
        <p class="text-lg font-semibold">{{ props.queuedTasks }}</p>
        <p class="text-[10px] uppercase tracking-wide text-[rgb(var(--muted-foreground))]">Tasks in queue</p>
      </div>
      <div>
        <p class="text-lg font-semibold">{{ props.reviewingTasks }}</p>
        <p class="text-[10px] uppercase tracking-wide text-[rgb(var(--muted-foreground))]">In review</p>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <button class="panel-muted px-3 py-1.5 text-xs font-medium">Docs</button>
      <button
        class="panel-muted px-3 py-1.5 text-xs font-medium"
        type="button"
        @click="toggleTheme"
      >
        {{ isDark ? 'Light' : 'Dark' }}
      </button>
    </div>
  </header>
</template>
