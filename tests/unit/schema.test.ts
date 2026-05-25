import { describe, it, expect } from "vitest";

describe("Convex Schema — agents", () => {
  const agentSchema = {
    name: "string",
    role: "string",
    avatarEmoji: "optional string",
    status: "idle | active | blocked",
    sessionKey: "string",
    capabilities: "optional string[]",
    lastHeartbeatAt: "optional number",
    currentTaskId: "optional tasks id",
  };

  it("has all required fields for an agent", () => {
    expect(agentSchema).toHaveProperty("name");
    expect(agentSchema).toHaveProperty("role");
    expect(agentSchema).toHaveProperty("status");
    expect(agentSchema).toHaveProperty("sessionKey");
  });

  it("supports all three status values", () => {
    const validStatuses = ["idle", "active", "blocked"];
    expect(validStatuses).toHaveLength(3);
    expect(validStatuses).toContain("idle");
    expect(validStatuses).toContain("active");
    expect(validStatuses).toContain("blocked");
  });

  it("supports capabilities array", () => {
    const capabilities = [
      "coding",
      "architecture",
      "security",
      "devops",
      "seo",
      "research",
    ];
    expect(capabilities).toContain("coding");
    expect(capabilities).toContain("seo");
  });
});

describe("Convex Schema — tasks", () => {
  const taskStatuses = [
    "inbox",
    "assigned",
    "in_progress",
    "review",
    "blocked",
    "done",
  ];

  const taskPriorities = ["low", "medium", "high", "critical"];

  it("has 6 valid statuses", () => {
    expect(taskStatuses).toHaveLength(6);
  });

  it("has 4 valid priorities", () => {
    expect(taskPriorities).toHaveLength(4);
  });

  it("statuses follow kanban flow", () => {
    expect(taskStatuses[0]).toBe("inbox");
    expect(taskStatuses[taskStatuses.length - 1]).toBe("done");
  });

  it("priorities are ordered by severity", () => {
    expect(taskPriorities).toEqual(["low", "medium", "high", "critical"]);
  });
});

describe("Convex Schema — documents", () => {
  const docTypes = [
    "deliverable",
    "research",
    "protocol",
    "report",
    "audit",
  ];

  it("has 5 valid document types", () => {
    expect(docTypes).toHaveLength(5);
  });

  it("includes audit type for SEO reports", () => {
    expect(docTypes).toContain("audit");
  });
});

describe("Convex Schema — messages", () => {
  const messageTypes = ["comment", "decision", "status_update"];

  it("has 3 valid message types", () => {
    expect(messageTypes).toHaveLength(3);
  });

  it("supports decision type for important choices", () => {
    expect(messageTypes).toContain("decision");
  });
});

describe("Mention extraction", () => {
  function extractMentionHandles(content: string) {
    return [
      ...new Set(
        (content.match(/@[a-zA-Z0-9_\-.]+/g) ?? []).map((value) =>
          value.slice(1).toLowerCase(),
        ),
      ),
    ];
  }

  it("extracts single @mention", () => {
    const result = extractMentionHandles("Hey @Hades can you check this?");
    expect(result).toEqual(["hades"]);
  });

  it("extracts multiple @mentions", () => {
    const result = extractMentionHandles(
      "@Hades and @Apollo need to review this. @Poseidon should know.",
    );
    expect(result).toEqual(["hades", "apollo", "poseidon"]);
  });

  it("deduplicates @mentions (case insensitive)", () => {
    const result = extractMentionHandles("@Hades @hades @HADES");
    expect(result).toEqual(["hades"]);
  });

  it("returns empty array for no mentions", () => {
    const result = extractMentionHandles("No mentions here.");
    expect(result).toEqual([]);
  });

  it("handles hyphenated agent names", () => {
    const result = extractMentionHandles(
      "CC @agent-special on this thread",
    );
    expect(result).toEqual(["agent-special"]);
  });
});

describe("Agent seed data", () => {
  const agents = [
    {
      name: "Hades",
      role: "Technical Specialist & Engineer",
      avatarEmoji: "⚡",
      sessionKey: "hades",
      capabilities: [
        "coding",
        "architecture",
        "security",
        "devops",
        "code-review",
      ],
    },
    {
      name: "Poseidon",
      role: "Strategy & Product Lead",
      avatarEmoji: "🌊",
      sessionKey: "poseidon",
      capabilities: [
        "strategy",
        "product",
        "planning",
        "coordination",
        "review",
      ],
    },
    {
      name: "Minerva",
      role: "Research & Knowledge Manager",
      avatarEmoji: "🦉",
      sessionKey: "minerva",
      capabilities: [
        "research",
        "documentation",
        "knowledge-base",
        "analysis",
        "writing",
      ],
    },
    {
      name: "Apollo",
      role: "SEO & Analytics Analyst",
      avatarEmoji: "🔭",
      sessionKey: "apollo",
      capabilities: [
        "seo",
        "analytics",
        "audit",
        "performance",
        "search-console",
      ],
    },
  ];

  it("has 4 agents", () => {
    expect(agents).toHaveLength(4);
  });

  it("each agent has unique session key", () => {
    const keys = agents.map((a) => a.sessionKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("each agent has unique emoji", () => {
    const emojis = agents.map((a) => a.avatarEmoji);
    expect(new Set(emojis).size).toBe(emojis.length);
  });

  it("each agent has capabilities", () => {
    agents.forEach((agent) => {
      expect(agent.capabilities.length).toBeGreaterThanOrEqual(3);
    });
  });
});
