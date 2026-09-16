import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { getClientIp, rateLimiter } from "@/lib/rate-limit";

export async function GET() {
  return NextResponse.json(store.list());
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const { allowed, retryAfter } = rateLimiter.check(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  const body = await req.json();
  if (!body.title || typeof body.title !== "string") {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  const issue = store.create(body);
  return NextResponse.json(issue, { status: 201 });
}
