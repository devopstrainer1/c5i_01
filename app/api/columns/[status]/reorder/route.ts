import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import type { Status } from "@/lib/types";

type Params = { params: Promise<{ status: string }> };

export async function PUT(req: Request, { params }: Params) {
  const { status } = await params;
  const body = await req.json();
  if (!Array.isArray(body.orderedIds)) {
    return NextResponse.json({ error: "orderedIds must be an array" }, { status: 400 });
  }
  const result = store.reorder(status as Status, body.orderedIds);
  return NextResponse.json(result);
}
