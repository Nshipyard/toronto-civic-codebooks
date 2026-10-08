import { NextResponse } from "next/server";
import { searchAll } from "@/lib/codes";

const TABLES = new Set(["all", "noc", "infractions", "procurement"]);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const table = searchParams.get("table") ?? "all";
  const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 25) || 25, 1), 100);

  if (q.trim().length < 2) {
    return NextResponse.json({ error: "Use ?q=<at least 2 characters>" }, { status: 400 });
  }
  if (!TABLES.has(table)) {
    return NextResponse.json({ error: "table must be all, noc, infractions, or procurement" }, { status: 400 });
  }
  const results = searchAll(q, limit).filter((r) => table === "all" || r.table === table);
  return NextResponse.json({ query: q, table, count: results.length, results });
}
