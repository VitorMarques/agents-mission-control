<script setup lang="ts">
import type { AgentStatus } from "~/types/mission";

const props = defineProps<{
  status: AgentStatus;
}>();

const statusStyleMap: Record<AgentStatus, string> = {
  idle: "bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300",
  active:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  blocked: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
};

const statusLabelMap: Record<AgentStatus, string> = {
  idle: "Idle",
  active: "Working",
  blocked: "Blocked",
};
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
    :class="statusStyleMap[props.status]"
  >
    {{ statusLabelMap[props.status] }}
  </span>
</template>
