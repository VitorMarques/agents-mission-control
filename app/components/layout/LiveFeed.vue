<script setup lang="ts">
import type { FeedEvent } from "~/types/mission";

const props = defineProps<{
  feed: FeedEvent[];
}>();
</script>

<template>
  <aside
    class="panel scroll-thin hidden h-[calc(100vh-6.5rem)] min-w-[290px] flex-col overflow-y-auto p-3 xl:flex"
  >
    <div class="mb-3 flex items-center justify-between">
      <h2
        class="text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--muted-foreground))]"
      >
        Live Feed
      </h2>
      <span
        class="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
        >Live</span
      >
    </div>

    <ul class="space-y-2">
      <li v-for="event in props.feed" :key="event.id" class="panel-muted p-2">
        <p
          class="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted-foreground))]"
        >
          {{ event.author }}
        </p>
        <p class="text-sm">{{ event.summary }}</p>
        <p class="mt-1 text-xs text-[rgb(var(--muted-foreground))]">
          {{ event.timestampLabel }}
        </p>
      </li>
    </ul>
  </aside>
</template>
