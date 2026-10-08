import { NextResponse } from "next/server";

const spec = {
  openapi: "3.1.0",
  info: {
    title: "Toronto Civic Codebooks API",
    version: "1.0.0",
    description:
      "Reference tables for Toronto civic data: 516 NOC 2021 occupations (Statistics Canada), 195 Toronto parking infraction codes with real ticket totals, 4,909 GSIN procurement codes (PSPC). MIT licensed.",
  },
  servers: [{ url: "https://codebooks.canada.nshipyard.com/api/v1" }],
  paths: {
    "/codes/search": {
      get: {
        summary: "Unified search across all three codebooks",
        parameters: [
          { name: "q", in: "query", required: true, schema: { type: "string" }, example: "nurse" },
          { name: "table", in: "query", schema: { type: "string", enum: ["all", "noc", "infractions", "procurement"] } },
          { name: "limit", in: "query", schema: { type: "integer" } },
        ],
        responses: { "200": { description: "Matching codes across tables" } },
      },
    },
    "/codes/noc": {
      get: {
        summary: "List NOC 2021 occupations",
        parameters: [
          { name: "q", in: "query", schema: { type: "string" } },
          { name: "teer", in: "query", schema: { type: "string", enum: ["0", "1", "2", "3", "4", "5"] } },
        ],
        responses: { "200": { description: "Occupations with EN/FR titles and TEER" } },
      },
    },
    "/codes/noc/{code}": {
      get: {
        summary: "One NOC occupation",
        parameters: [{ name: "code", in: "path", required: true, schema: { type: "string" }, example: "21211" }],
        responses: { "200": { description: "Occupation record" }, "404": { description: "Unknown code" } },
      },
    },
    "/codes/infractions": {
      get: {
        summary: "List Toronto parking infraction codes",
        parameters: [{ name: "q", in: "query", schema: { type: "string" } }],
        responses: { "200": { description: "Codes with ticket and fine totals" } },
      },
    },
    "/codes/infractions/{code}": {
      get: {
        summary: "One parking infraction code",
        parameters: [{ name: "code", in: "path", required: true, schema: { type: "string" }, example: "3" }],
        responses: { "200": { description: "Infraction record" }, "404": { description: "Unknown code" } },
      },
    },
    "/codes/procurement": {
      get: {
        summary: "List GSIN procurement codes",
        parameters: [
          { name: "q", in: "query", schema: { type: "string" } },
          { name: "type", in: "query", schema: { type: "string", enum: ["Goods", "Service", "Construction"] } },
        ],
        responses: { "200": { description: "GSIN codes with EN/FR descriptions" } },
      },
    },
    "/codes/procurement/{code}": {
      get: {
        summary: "One GSIN procurement code",
        parameters: [{ name: "code", in: "path", required: true, schema: { type: "string" }, example: "V502A" }],
        responses: { "200": { description: "GSIN record" }, "404": { description: "Unknown code" } },
      },
    },
    "/codes/summary": {
      get: {
        summary: "Table counts, sources, and methodology notes",
        responses: { "200": { description: "Summary document" } },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(spec);
}
