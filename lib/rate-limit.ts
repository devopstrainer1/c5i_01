const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;

interface Bucket {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private buckets = new Map<string, Bucket>();

  check(key: string): { allowed: boolean; retryAfter: number } {
    const now = Date.now();
    const bucket = this.buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
      return { allowed: true, retryAfter: 0 };
    }

    if (bucket.count < MAX_REQUESTS) {
      bucket.count += 1;
      return { allowed: true, retryAfter: 0 };
    }

    return { allowed: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
}

// Persist a single instance across Next.js dev hot-reloads.
const globalForRateLimiter = globalThis as unknown as { __rateLimiter?: RateLimiter };
export const rateLimiter = globalForRateLimiter.__rateLimiter ?? new RateLimiter();
if (process.env.NODE_ENV !== "production") globalForRateLimiter.__rateLimiter = rateLimiter;

export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}
