import { NextResponse } from "next/server";
import { getData } from "@/lib/codes";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const teer = searchParams.get("teer") ?? "";
  const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 100) || 100, 1), 516);

  if (teer && !/^[0-5]$/.test(teer)) {
    return NextResponse.json({ error: "teer must be a single digit 0-5" }, { status: 400 });
  }
  let rows = getData().noc;
  if (teer) rows = rows.filter((r) => r.teer === teer);
  if (q) rows = rows.filter((r) => r.code.includes(q) || r.title_en.toLowerCase().includes(q) || r.title_fr.toLowerCase().includes(q));
  return NextResponse.json({ count: rows.length, occupations: rows.slice(0, limit) });
}
