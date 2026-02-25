import { describe, expect, it } from "vitest";

import { useMissionMockData } from "../../app/composables/useMissionMockData";

describe("useMissionMockData", () => {
  it("returns grouped task-centric datasets", () => {
    const data = useMissionMockData();

    expect(data.tasks.length).toBeGreaterThan(0);
    expect(data.messagesByTask.t1?.length).toBeGreaterThan(0);
    expect(data.activitiesByTask.t1?.[0]?.type).toBe("task_created");
    expect(data.documentsByTask.t1?.[0]?.title).toContain("Feature");
    expect(data.notificationsByTask.t3?.[0]?.mentionedAgentId).toBe("a3");
  });
});
