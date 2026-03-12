import { describe, expect, it } from "vitest";

import {
  createSessionToken,
  getSessionCookieName,
  getSessionExpiry,
  hashSessionToken,
} from "../../server/utils/session";

describe("session utils", () => {
  it("generates 64-char hex session token", () => {
    const token = createSessionToken();
    expect(token).toMatch(/^[a-f0-9]{64}$/);
  });

  it("hashes deterministically", () => {
    const token = "abc123";
    expect(hashSessionToken(token)).toEqual(hashSessionToken(token));
  });

  it("returns stable cookie name", () => {
    expect(getSessionCookieName()).toBe("amc_session");
  });

  it("expires in the future", () => {
    expect(getSessionExpiry()).toBeGreaterThan(Date.now());
  });
});
