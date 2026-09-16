import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

async function freshLimiter() {
  vi.resetModules();
  return import("./rate-limit");
}

describe("rate-limit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows up to 20 requests per minute for one IP, then blocks the 21st", async () => {
    const { rateLimiter } = await freshLimiter();

    for (let i = 0; i < 20; i++) {
      const result = rateLimiter.check("1.2.3.4");
      expect(result.allowed).toBe(true);
    }

    const blocked = rateLimiter.check("1.2.3.4");
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
    expect(blocked.retryAfter).toBeLessThanOrEqual(60);
  });

  it("tracks separate IPs independently", async () => {
    const { rateLimiter } = await freshLimiter();

    for (let i = 0; i < 20; i++) {
      expect(rateLimiter.check("1.1.1.1").allowed).toBe(true);
    }
    expect(rateLimiter.check("1.1.1.1").allowed).toBe(false);

    expect(rateLimiter.check("2.2.2.2").allowed).toBe(true);
  });

  it("resets the window after 60 seconds", async () => {
    const { rateLimiter } = await freshLimiter();

    for (let i = 0; i < 20; i++) {
      rateLimiter.check("9.9.9.9");
    }
    expect(rateLimiter.check("9.9.9.9").allowed).toBe(false);

    vi.advanceTimersByTime(60_000);

    expect(rateLimiter.check("9.9.9.9").allowed).toBe(true);
  });
});

describe("getClientIp", () => {
  it("prefers x-forwarded-for, then x-real-ip, then falls back to unknown", async () => {
    const { getClientIp } = await freshLimiter();

    const withForwarded = new Request("http://localhost/api/issues", {
      headers: { "x-forwarded-for": "5.5.5.5, 6.6.6.6" },
    });
    expect(getClientIp(withForwarded)).toBe("5.5.5.5");

    const withRealIp = new Request("http://localhost/api/issues", {
      headers: { "x-real-ip": "7.7.7.7" },
    });
    expect(getClientIp(withRealIp)).toBe("7.7.7.7");

    const withNeither = new Request("http://localhost/api/issues");
    expect(getClientIp(withNeither)).toBe("unknown");
  });
});
