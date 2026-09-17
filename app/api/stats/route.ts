import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { STATUSES } from "@/lib/types";

export async function GET() {
  const issues = store.list();
  const byStatus = Object.fromEntries(
    STATUSES.map(({ key }) => [key, issues.filter((issue) => issue.status === key).length]),
  );
  return NextResponse.json({ total: issues.length, byStatus });
}
