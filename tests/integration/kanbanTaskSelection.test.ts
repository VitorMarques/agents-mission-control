import { mount } from "@vue/test-utils";
import { defineComponent, ref } from "vue";
import { describe, expect, it } from "vitest";

import KanbanBoard from "../../app/components/layout/KanbanBoard.vue";
import TaskDetailPanel from "../../app/components/layout/TaskDetailPanel.vue";

const fixtureData = {
  agents: [
    {
      id: "a1",
      name: "Agent One",
      role: "Engineer",
      status: "active" as const,
      currentTaskId: "t1",
    },
  ],
  tasks: [
    {
      id: "t1",
      title: "Task One",
      description: "First task",
      status: "inbox" as const,
      assigneeIds: ["a1"],
      labels: ["priority"],
    },
  ],
  columns: [
    { status: "inbox" as const, label: "Inbox" },
    { status: "assigned" as const, label: "Assigned" },
    { status: "in_progress" as const, label: "In Progress" },
    { status: "review" as const, label: "Review" },
    { status: "done" as const, label: "Done" },
  ],
  messagesByTask: {
    t1: [
      {
        id: "m1",
        taskId: "t1",
        fromAgentId: "a1",
        content: "mensagem",
        attachments: [],
        timestampLabel: "agora",
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
      components: { KanbanBoard, TaskDetailPanel },
      setup() {
        const selectedTaskId = ref<string | null>(data.tasks[0]?.id ?? null);
        const selectedTask = ref<(typeof data.tasks)[number] | null>(
          data.tasks[0] ?? null,
        );

        function selectTask(task: { id: string }) {
          selectedTaskId.value = task.id;
          selectedTask.value =
            data.tasks.find((item: { id: string }) => item.id === task.id) ??
            null;
        }

        return { data, selectedTask, selectTask, selectedTaskId };
      },
      template: `
        <div>
          <KanbanBoard :tasks="data.tasks" :columns="data.columns" @select-task="selectTask" />
          <TaskDetailPanel
            :task="selectedTask"
            :agents="data.agents"
            :messages="data.messagesByTask[selectedTaskId ?? ''] ?? []"
            :activities="data.activitiesByTask[selectedTaskId ?? ''] ?? []"
            :documents="data.documentsByTask[selectedTaskId ?? ''] ?? []"
            :notifications="data.notificationsByTask[selectedTaskId ?? ''] ?? []"
          />
        </div>
      `,
    });

    const wrapper = mount(Harness);
    const taskCards = wrapper.findAll('[role="button"]');

    expect(taskCards.length).toBeGreaterThan(0);

    await taskCards[0]?.trigger("click");
    expect(wrapper.text()).toContain("Task Detail");
  });
});
