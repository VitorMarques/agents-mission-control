import { describe, expect, it } from "vitest";

function groupByTaskId<T extends { taskId: string }>(items: T[]) {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    if (!acc[item.taskId]) {
      acc[item.taskId] = [];
    }
    acc[item.taskId]?.push(item);
    return acc;
  }, {});
}

describe("task grouping helper", () => {
  it("groups entities by taskId", () => {
    const grouped = groupByTaskId([
      { taskId: "t1", id: "m1" },
      { taskId: "t1", id: "m2" },
      { taskId: "t2", id: "m3" },
    ]);

    expect(grouped.t1?.length).toBe(2);
    expect(grouped.t2?.[0]?.id).toBe("m3");
  });
});
