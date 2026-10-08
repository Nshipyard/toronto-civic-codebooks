import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export async function GET() {
  const raw = fs.readFileSync(path.join(process.cwd(), "data", "summary.json"), "utf8");
  return NextResponse.json(JSON.parse(raw));
}
