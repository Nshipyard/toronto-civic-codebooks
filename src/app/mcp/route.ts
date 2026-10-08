import { NextResponse } from "next/server";
import { getData, searchAll } from "@/lib/codes";

// Minimal MCP server over streamable HTTP (JSON-RPC 2.0 via POST).
// Supports: initialize, tools/list, tools/call. Stateless.

const SERVER = { name: "toronto-civic-codebooks", version: "1.0.0" };

const TOOLS = [
  {
    name: "codes_lookup",
    description:
      "Resolve one civic code to its full record: a NOC 2021 occupation (5-digit code), a Toronto parking infraction (numeric code), or a GSIN procurement code.",
    inputSchema: {
      type: "object",
      properties: {
        table: { type: "string", enum: ["noc", "infractions", "procurement"] },
        code: { type: "string", description: "The code, e.g. '21211', '3', or 'V502A'" },
      },
      required: ["table", "code"],
    },
  },
  {
    name: "codes_search",
    description:
      "Search all three codebooks (516 NOC occupations, 195 Toronto parking infractions, 4,909 GSIN procurement codes) by code or keyword.",
    inputSchema: {
      type: "object",
      properties: {
        q: { type: "string", description: "Code fragment or keyword, e.g. 'nurse' or '21211'" },
        table: { type: "string", enum: ["all", "noc", "infractions", "procurement"], default: "all" },
        limit: { type: "integer", default: 25 },
      },
      required: ["q"],
    },
  },
];

function ok(id: unknown, result: unknown) {
  return { jsonrpc: "2.0", id, result };
}
function err(id: unknown, code: number, message: string) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}
function textResult(data: unknown) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

interface JsonRpcMsg {
  jsonrpc?: string;
  method?: string;
  id?: unknown;
  params?: { name?: string; arguments?: Record<string, unknown> };
}

function handle(msg: JsonRpcMsg) {
  if (!msg || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") {
    return err(msg?.id ?? null, -32600, "Invalid Request");
  }
  const id = msg.id ?? null;
  switch (msg.method) {
    case "initialize":
      return ok(id, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: SERVER,
      });
    case "notifications/initialized":
      return null;
    case "tools/list":
      return ok(id, { tools: TOOLS });
    case "tools/call": {
      const { name, arguments: args } = msg.params ?? {};
      try {
        if (name === "codes_lookup") {
          const table = String(args?.table ?? "");
          const code = String(args?.code ?? "");
          const { nocByCode, infByCode, gsinByCode } = getData();
          const rec =
            table === "noc"
              ? nocByCode.get(code)
              : table === "infractions"
                ? infByCode.get(code)
                : table === "procurement"
                  ? gsinByCode.get(code.toUpperCase())
                  : undefined;
          if (!rec) return err(id, -32001, `Unknown code ${code} in table ${table}`);
          return ok(id, textResult({ table, ...rec }));
        }
        if (name === "codes_search") {
          const q = String(args?.q ?? "");
          const table = String(args?.table ?? "all");
          const limit = Math.min(Math.max(Number(args?.limit ?? 25) || 25, 1), 100);
          if (q.trim().length < 2) return err(id, -32002, "q must be at least 2 characters");
          const results = searchAll(q, limit).filter((r) => table === "all" || r.table === table);
          return ok(id, textResult({ query: q, count: results.length, results }));
        }
        return err(id, -32601, `Unknown tool ${name}`);
      } catch (e) {
        return err(id, -32000, `Tool failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    default:
      return err(id, -32601, `Unknown method ${msg.method}`);
  }
}

export async function POST(req: Request) {
  let body: JsonRpcMsg;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(err(null, -32700, "Parse error"), { status: 400 });
  }
  const messages = Array.isArray(body) ? body : [body];
  const responses = messages.map(handle).filter((r) => r !== null);
  if (responses.length === 0) return new NextResponse(null, { status: 202 });
  return NextResponse.json(Array.isArray(body) ? responses : responses[0], {
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET() {
  return NextResponse.json({ error: "Use POST with JSON-RPC 2.0" }, { status: 405 });
}
