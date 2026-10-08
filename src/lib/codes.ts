import fs from "node:fs";
import path from "node:path";

const DATA = path.join(process.cwd(), "data");

export interface NocRow {
  code: string;
  title_en: string;
  title_fr: string;
  teer: string;
  broad_category: string;
  major_group: string;
}

export interface InfractionRow {
  code: string;
  description: string;
  tickets: number;
  total_fines: number;
  avg_fine: number;
}

export interface GsinRow {
  code: string;
  description_en: string;
  description_fr: string;
  status: string;
  commodity_type: string;
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, "\n").trim().split("\n");
  const headers = splitLine(lines[0]);
  return lines.slice(1).map((line) => {
    const vals = splitLine(line);
    const o: Record<string, string> = {};
    headers.forEach((h, i) => (o[h] = vals[i] ?? ""));
    return o;
  });
}

function splitLine(line: string): string[] {
  const vals: string[] = [];
  let cur = "",
    inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else inQ = !inQ;
    } else if (ch === "," && !inQ) {
      vals.push(cur);
      cur = "";
    } else cur += ch;
  }
  vals.push(cur);
  return vals;
}

const num = (s: string) => {
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};

let cache: {
  noc: NocRow[];
  nocByCode: Map<string, NocRow>;
  inf: InfractionRow[];
  infByCode: Map<string, InfractionRow>;
  gsin: GsinRow[];
  gsinByCode: Map<string, GsinRow>;
} | null = null;

export function getData() {
  if (cache) return cache;
  const noc: NocRow[] = parseCsv(fs.readFileSync(path.join(DATA, "noc_2021.csv"), "utf8")).map((r) => ({
    code: r.code,
    title_en: r.title_en,
    title_fr: r.title_fr,
    teer: r.teer,
    broad_category: r.broad_category,
    major_group: r.major_group,
  }));
  const inf: InfractionRow[] = parseCsv(fs.readFileSync(path.join(DATA, "infraction_codebook.csv"), "utf8")).map((r) => ({
    code: r.infraction_code,
    description: r.description,
    tickets: num(r.tickets),
    total_fines: num(r.total_fines),
    avg_fine: num(r.avg_fine),
  }));
  const gsin: GsinRow[] = parseCsv(fs.readFileSync(path.join(DATA, "procurement_codes.csv"), "utf8")).map((r) => ({
    code: r.code,
    description_en: r.description_en,
    description_fr: r.description_fr,
    status: r.status,
    commodity_type: r.commodity_type,
  }));
  cache = {
    noc,
    nocByCode: new Map(noc.map((r) => [r.code, r])),
    inf,
    infByCode: new Map(inf.map((r) => [r.code, r])),
    gsin,
    gsinByCode: new Map(gsin.map((r) => [r.code, r])),
  };
  return cache;
}

export function searchAll(q: string, limit = 25) {
  const { noc, inf, gsin } = getData();
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  const out: { table: string; code: string; title: string; detail: string }[] = [];
  const push = (table: string, code: string, title: string, detail: string) => {
    if (out.length < limit) out.push({ table, code, title, detail });
  };
  for (const r of noc) {
    if (r.code.includes(needle) || r.title_en.toLowerCase().includes(needle) || r.title_fr.toLowerCase().includes(needle))
      push("noc", r.code, r.title_en, `TEER ${r.teer} · ${r.broad_category}`);
  }
  for (const r of inf) {
    if (r.code.includes(needle) || r.description.toLowerCase().includes(needle))
      push("infractions", r.code, r.description, `${r.tickets.toLocaleString("en-CA")} tickets`);
  }
  for (const r of gsin) {
    if (r.code.toLowerCase().includes(needle) || r.description_en.toLowerCase().includes(needle) || r.description_fr.toLowerCase().includes(needle))
      push("procurement", r.code, r.description_en, r.commodity_type);
  }
  return out;
}
