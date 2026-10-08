import { NextResponse } from "next/server";
import { getData } from "@/lib/codes";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 195) || 195, 1), 195);

  let rows = getData().inf;
  if (q) rows = rows.filter((r) => r.code.includes(q) || r.description.toLowerCase().includes(q));
  return NextResponse.json({ count: rows.length, infractions: rows.slice(0, limit) });
}
