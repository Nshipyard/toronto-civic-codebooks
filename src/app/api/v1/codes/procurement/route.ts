import { NextResponse } from "next/server";
import { getData } from "@/lib/codes";

const TYPES = new Set(["Goods", "Service", "Construction"]);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const type = searchParams.get("type") ?? "";
  const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 100) || 100, 1), 500);

  if (type && !TYPES.has(type)) {
    return NextResponse.json({ error: "type must be Goods, Service, or Construction" }, { status: 400 });
  }
  let rows = getData().gsin;
  if (type) rows = rows.filter((r) => r.commodity_type === type);
  if (q)
    rows = rows.filter(
      (r) => r.code.toLowerCase().includes(q) || r.description_en.toLowerCase().includes(q) || r.description_fr.toLowerCase().includes(q)
    );
  return NextResponse.json({ count: rows.length, codes: rows.slice(0, limit) });
}
