import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/stats", () => {
  it("returns total and per-status counts from the store", async () => {
    const res = await GET();
    const data = await res.json();

    expect(typeof data.total).toBe("number");
    expect(data.byStatus).toEqual(
      expect.objectContaining({
        backlog: expect.any(Number),
        todo: expect.any(Number),
        in_progress: expect.any(Number),
        done: expect.any(Number),
      }),
    );

    const sum = Object.values(data.byStatus as Record<string, number>).reduce(
      (a, b) => a + b,
      0,
    );
    expect(sum).toBe(data.total);
  });
});
