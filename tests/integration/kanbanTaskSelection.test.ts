import { mount } from "@vue/test-utils";
import { defineComponent, ref } from "vue";
import { describe, expect, it } from "vitest";

import KanbanBoard from "../../app/components/layout/KanbanBoard.vue";
import TaskDetailModal from "../../app/components/layout/TaskDetailModal.vue";

const fixtureData = {
  agents: [
    {
      id: "a1",
      name: "Hades",
      role: "Technical Specialist",
      avatarEmoji: "⚡",
      status: "active" as const,
      currentTaskId: "t1",
      lastHeartbeatAt: null,
      capabilities: ["coding"],
    },
  ],
  tasks: [
    {
      id: "t1",
      title: "Fix canonical URLs",
      description: "Remove double slashes from canonicals",
      status: "inbox" as const,
      priority: "high" as const,
      assigneeIds: ["a1"],
      tags: ["seo"],
      labels: ["seo"],
      subscriberIds: ["a1"],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ],
  columns: [
    { status: "inbox" as const, label: "Inbox" },
    { status: "assigned" as const, label: "Assigned" },
    { status: "in_progress" as const, label: "In Progress" },
    { status: "review" as const, label: "Review" },
    { status: "blocked" as const, label: "Blocked" },
    { status: "done" as const, label: "Done" },
  ],
  messagesByTask: {
    t1: [
      {
        id: "m1",
        taskId: "t1",
        fromAgentId: "a1",
        content: "Investigando o problema",
        attachments: [],
        timestampLabel: "agora",
        type: "comment",
      },
    ],
  },
  activitiesByTask: {},
  documentsByTask: {},
  notificationsByTask: {},
};

describe("task-centric board flow", () => {
  it("updates selected task when a card is clicked", async () => {
    const data = fixtureData;

    const Harness = defineComponent({
      components: { KanbanBoard, TaskDetailModal },
      setup() {
        const selectedTaskId = ref<string | null>(data.tasks[0]?.id ?? null);
        const selectedTask = ref<(typeof data.tasks)[number] | null>(
          data.tasks[0] ?? null,
        );
        const showModal = ref(false);

        function selectTask(task: { id: string }) {
          selectedTaskId.value = task.id;
          selectedTask.value =
            data.tasks.find((item: { id: string }) => item.id === task.id) ??
            null;
          showModal.value = true;
        }

        return { data, selectedTask, selectTask, selectedTaskId, showModal };
      },
      template: `
        <div>
          <KanbanBoard
            :tasks="data.tasks"
            :columns="data.columns"
            :agents="data.agents"
            :can-move-status="true"
            @select-task="selectTask"
          />
          <TaskDetailModal
            v-if="showModal"
            :task="selectedTask"
            :agents="data.agents"
            :messages="data.messagesByTask[selectedTaskId ?? ''] ?? []"
            :activities="data.activitiesByTask[selectedTaskId ?? ''] ?? []"
            :documents="data.documentsByTask[selectedTaskId ?? ''] ?? []"
            :notifications="data.notificationsByTask[selectedTaskId ?? ''] ?? []"
            @close="showModal = false"
          />
        </div>
      `,
    });

    const wrapper = mount(Harness, {
      global: {
        stubs: {
          Teleport: {
            template: "<div><slot /></div>",
          },
          "lucide-vue-next": {
            X: { template: "<span>close</span>" },
          },
        },
      },
    });

    const taskCards = wrapper.findAll('[role="button"]');
    expect(taskCards.length).toBeGreaterThan(0);

    await taskCards[0]?.trigger("click");
    expect(wrapper.text()).toContain("Fix canonical URLs");
    expect(wrapper.text()).toContain("Investigando o problema");
  });

  it("shows priority badge on task card", () => {
    const data = fixtureData;

    const Harness = defineComponent({
      components: { KanbanBoard },
      setup() {
        return { data };
      },
      template: `
        <KanbanBoard
          :tasks="data.tasks"
          :columns="data.columns"
          :agents="data.agents"
          :can-move-status="true"
        />
      `,
    });

    const wrapper = mount(Harness);
    expect(wrapper.text()).toContain("high");
  });
});
