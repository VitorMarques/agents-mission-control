import { describe, it, expect } from "vitest";

// Test utility functions that mirror server-side logic

function normalizeTaskStatus(value: string) {
  const valid = [
    "inbox",
    "assigned",
    "in_progress",
    "review",
    "blocked",
    "done",
  ];
  return valid.includes(value) ? value : "inbox";
}

function normalizePriority(value: string) {
  const valid = ["low", "medium", "high", "critical"];
  return valid.includes(value) ? value : "medium";
}

function toTimestampLabel(createdAt?: number) {
  if (!createdAt) return "agora";
  const minutes = Math.max(1, Math.floor((Date.now() - createdAt) / 60000));
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `há ${days}d`;
}

function groupByTaskId<T extends { taskId?: string }>(items: T[]) {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    if (!item.taskId) return acc;
    if (!acc[item.taskId]) acc[item.taskId] = [];
    acc[item.taskId]!.push(item);
    return acc;
  }, {});
}

describe("normalizeTaskStatus", () => {
  it("returns valid statuses as-is", () => {
    expect(normalizeTaskStatus("inbox")).toBe("inbox");
    expect(normalizeTaskStatus("in_progress")).toBe("in_progress");
    expect(normalizeTaskStatus("done")).toBe("done");
  });

  it("defaults to inbox for invalid values", () => {
    expect(normalizeTaskStatus("pending")).toBe("inbox");
    expect(normalizeTaskStatus("unknown")).toBe("inbox");
    expect(normalizeTaskStatus("")).toBe("inbox");
  });
});

describe("normalizePriority", () => {
  it("returns valid priorities as-is", () => {
    expect(normalizePriority("low")).toBe("low");
    expect(normalizePriority("critical")).toBe("critical");
  });

  it("defaults to medium for invalid values", () => {
    expect(normalizePriority("urgent")).toBe("medium");
    expect(normalizePriority("")).toBe("medium");
  });
});

describe("toTimestampLabel", () => {
  it("returns 'agora' for undefined", () => {
    expect(toTimestampLabel(undefined)).toBe("agora");
  });

  it("returns minutes for recent timestamps", () => {
    const fiveMinAgo = Date.now() - 5 * 60 * 1000;
    expect(toTimestampLabel(fiveMinAgo)).toBe("há 5 min");
  });

  it("returns hours for older timestamps", () => {
    const threeHoursAgo = Date.now() - 3 * 60 * 60 * 1000;
    expect(toTimestampLabel(threeHoursAgo)).toBe("há 3h");
  });

  it("returns days for very old timestamps", () => {
    const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
    expect(toTimestampLabel(twoDaysAgo)).toBe("há 2d");
  });

  it("returns at least 1 minute", () => {
    const justNow = Date.now() - 100;
    expect(toTimestampLabel(justNow)).toBe("há 1 min");
  });
});

describe("groupByTaskId", () => {
  it("groups items by taskId", () => {
    const items = [
      { id: "1", taskId: "task-a", content: "msg1" },
      { id: "2", taskId: "task-b", content: "msg2" },
      { id: "3", taskId: "task-a", content: "msg3" },
    ] as any[];

    const result = groupByTaskId(items);
    expect(result["task-a"]).toHaveLength(2);
    expect(result["task-b"]).toHaveLength(1);
  });

  it("skips items without taskId", () => {
    const items = [
      { id: "1", taskId: "task-a", content: "msg1" },
      { id: "2", content: "no task" },
    ] as any[];

    const result = groupByTaskId(items);
    expect(Object.keys(result)).toHaveLength(1);
  });

  it("returns empty object for empty array", () => {
    const result = groupByTaskId([]);
    expect(Object.keys(result)).toHaveLength(0);
  });
});
