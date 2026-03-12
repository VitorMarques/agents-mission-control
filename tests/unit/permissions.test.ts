import { describe, expect, it } from "vitest";

import { hasPermission } from "../../server/utils/permissions";

describe("permission matrix", () => {
  it("allows ADMIN to create users", () => {
    expect(hasPermission("ADMIN", "user:create")).toBe(true);
  });

  it("denies MANAGER user creation", () => {
    expect(hasPermission("MANAGER", "user:create")).toBe(false);
  });

  it("allows MANAGER to move task status", () => {
    expect(hasPermission("MANAGER", "task:status:move")).toBe(true);
  });

  it("denies VIEWER from mutating task status", () => {
    expect(hasPermission("VIEWER", "task:status:move")).toBe(false);
  });
});
