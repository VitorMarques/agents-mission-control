import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import TaskDetailPanel from "../../app/components/layout/TaskDetailPanel.vue";

describe("TaskDetailPanel", () => {
  it("renders selected task context and tab content", async () => {
    const wrapper = mount(TaskDetailPanel, {
      props: {
        task: {
          id: "t1",
          title: "Task A",
          description: "Description",
          status: "inbox",
          assigneeIds: ["a1"],
          labels: ["research"],
        },
        agents: [
          {
            id: "a1",
            name: "Bhanu",
            role: "Founder",
            status: "active",
            currentTaskId: "t1",
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
          },
        ],
        activities: [],
        documents: [],
        notifications: [],
      },
    });

    expect(wrapper.text()).toContain("Task A");
    expect(wrapper.text()).toContain("Mensagem de teste");

    await wrapper.findAll("button")[1]?.trigger("click");
    expect(wrapper.text()).toContain("Sem atividades");
  });
});
