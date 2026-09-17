import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/health", () => {
  it("returns ok status with an ISO timestamp", async () => {
    const res = await GET();
    const body = await res.json();

    expect(body.status).toBe("ok");
    expect(new Date(body.time).toISOString()).toBe(body.time);
  });
});
