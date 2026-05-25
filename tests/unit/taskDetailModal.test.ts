import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import TaskDetailModal from "../../app/components/layout/TaskDetailModal.vue";

describe("TaskDetailModal", () => {
  it("renders selected task context and tab content", async () => {
    const wrapper = mount(TaskDetailModal, {
      props: {
        task: {
          id: "t1",
          title: "Task A",
          description: "Description",
          status: "inbox",
          priority: "medium",
          assigneeIds: ["a1"],
          tags: ["research"],
          labels: ["research"],
          subscriberIds: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        agents: [
          {
            id: "a1",
            name: "Hades",
            role: "Technical Specialist",
            avatarEmoji: "⚡",
            status: "active",
            currentTaskId: "t1",
            lastHeartbeatAt: null,
            capabilities: ["coding"],
          },
        ],
        messages: [
          {
            id: "m1",
            taskId: "t1",
            fromAgentId: "a1",
            content: "Mensagem de teste",
            attachments: [],
            timestampLabel: "agora",
            type: "comment",
          },
        ],
        activities: [],
        documents: [],
        notifications: [],
      },
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

    expect(wrapper.text()).toContain("Task A");
    expect(wrapper.text()).toContain("Mensagem de teste");

    const activitiesButton = wrapper
      .findAll("button")
      .find((button) => button.text().includes("Activities"));
    await activitiesButton?.trigger("click");
    expect(wrapper.text()).toContain("Sem atividades");
  });

  it("shows priority badge", () => {
    const wrapper = mount(TaskDetailModal, {
      props: {
        task: {
          id: "t1",
          title: "Critical Task",
          description: "Urgent",
          status: "inbox",
          priority: "critical",
          assigneeIds: [],
          tags: [],
          labels: [],
          subscriberIds: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        agents: [],
        messages: [],
        activities: [],
        documents: [],
        notifications: [],
      },
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

    expect(wrapper.text()).toContain("critical");
  });

  it("shows decision messages with special styling", () => {
    const wrapper = mount(TaskDetailModal, {
      props: {
        task: {
          id: "t1",
          title: "Decision Task",
          description: "Important decision",
          status: "in_progress",
          priority: "high",
          assigneeIds: ["a1"],
          tags: [],
          labels: [],
          subscriberIds: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        agents: [
          {
            id: "a1",
            name: "Poseidon",
            role: "Strategy",
            avatarEmoji: "🌊",
            status: "active",
            currentTaskId: null,
            lastHeartbeatAt: null,
            capabilities: ["strategy"],
          },
        ],
        messages: [
          {
            id: "m1",
            taskId: "t1",
            fromAgentId: "a1",
            content: "Decidimos usar abordagem X",
            attachments: [],
            timestampLabel: "há 5 min",
            type: "decision",
          },
        ],
        activities: [],
        documents: [],
        notifications: [],
      },
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

    expect(wrapper.text()).toContain("Decidimos usar abordagem X");
    expect(wrapper.text()).toContain("Decision");
  });
});
