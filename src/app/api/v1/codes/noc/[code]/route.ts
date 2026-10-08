import { NextResponse } from "next/server";
import { getData } from "@/lib/codes";

export async function GET(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const r = getData().nocByCode.get(code);
  if (!r) return NextResponse.json({ error: `Unknown NOC code ${code}` }, { status: 404 });
  return NextResponse.json(r);
}
