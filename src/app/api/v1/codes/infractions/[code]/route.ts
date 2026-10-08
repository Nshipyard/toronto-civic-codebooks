import { NextResponse } from "next/server";
import { getData } from "@/lib/codes";

export async function GET(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const r = getData().infByCode.get(code);
  if (!r) return NextResponse.json({ error: `Unknown infraction code ${code}` }, { status: 404 });
  return NextResponse.json(r);
}
