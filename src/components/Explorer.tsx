"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/i18n";

interface Hit {
  table: string;
  code: string;
  title: string;
  detail: string;
}

const TABLES = ["all", "noc", "infractions", "procurement"] as const;

export default function Explorer() {
  const { t, lang } = useLang();
  const [q, setQ] = useState("");
  const [table, setTable] = useState<(typeof TABLES)[number]>("all");
  const [hits, setHits] = useState<Hit[]>([]);
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const needle = q.trim();
    if (needle.length < 2) {
      setHits([]);
      return;
    }
    setLoading(true);
    timer.current = setTimeout(async () => {
      try {
        const r = await fetch(`/api/v1/codes/search?q=${encodeURIComponent(needle)}&table=${table}&limit=30`);
        const j = await r.json();
        setHits(j.results ?? []);
      } catch {
        setHits([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q, table]);

  async function openDetail(h: Hit) {
    try {
      const r = await fetch(`/api/v1/codes/${h.table}/${encodeURIComponent(h.code)}`);
      const j = await r.json();
      setSelected({ table: h.table, ...j });
    } catch {
      setSelected(null);
    }
  }

  const tableLabel = (id: string) =>
    id === "all" ? t.explorer.all : id === "noc" ? t.explorer.noc : id === "infractions" ? t.explorer.infractions : t.explorer.procurement;

  return (
    <section id="explorer" className="bg-paper-warm">
      <div className="mx-auto max-w-[1392px] px-6 py-20 md:py-28">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-canada">{t.explorer.kicker}</p>
        <h2 className="display mt-4 max-w-[720px] text-[40px] md:text-[52px]">{t.explorer.title}</h2>

        <div className="mt-8 flex flex-col gap-3 md:flex-row">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.explorer.search}
            className="w-full rounded-full border border-line bg-paper px-6 py-3.5 text-[16px] outline-none placeholder:text-ink/40 focus:border-canada md:max-w-[520px]"
            aria-label={t.explorer.search}
          />
          <div className="flex flex-wrap gap-2">
            {TABLES.map((id) => (
              <button
                key={id}
                onClick={() => setTable(id)}
                className={`rounded-full px-4 py-2.5 text-[14px] font-medium ${table === id ? "bg-ink text-white" : "border border-line bg-paper text-ink/70 hover:border-ink"}`}
                aria-pressed={table === id}
              >
                {tableLabel(id)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 min-h-[120px]">
          {q.trim().length >= 2 && hits.length === 0 && !loading && (
            <p className="text-[16px] text-ink/60">{t.explorer.noResult}</p>
          )}
          {q.trim().length < 2 && <p className="max-w-[640px] text-[16px] leading-relaxed text-ink/60">{t.explorer.empty}</p>}
          {hits.length > 0 && (
            <div className="overflow-hidden rounded-[24px] border border-line bg-paper">
              {hits.map((h) => (
                <button
                  key={`${h.table}:${h.code}`}
                  onClick={() => openDetail(h)}
                  className="flex w-full items-center justify-between gap-4 border-b border-line px-6 py-4 text-left last:border-0 hover:bg-paper-warm"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="rounded bg-ink/5 px-2 py-0.5 font-mono text-[14px] font-semibold">{h.code}</code>
                      <span className="rounded-full bg-canada/10 px-2.5 py-0.5 text-[12px] font-medium text-canada">{tableLabel(h.table)}</span>
                    </div>
                    <p className="mt-1.5 truncate text-[16px] font-medium">{h.title}</p>
                    <p className="text-[13px] text-ink/55">{h.detail}</p>
                  </div>
                  <span className="shrink-0 text-[20px] text-ink/30">→</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {selected && <DetailView record={selected as { table: string } & Record<string, string>} onClose={() => setSelected(null)} />}
      </div>
    </section>
  );
}

function DetailView({ record, onClose }: { record: { table: string } & Record<string, string>; onClose: () => void }) {
  const { t, lang } = useLang();
  const rows: [string, string][] =
    record.table === "noc"
      ? [
          [t.explorer.code, record.code],
          [t.explorer.titleLabel, lang === "fr" ? record.title_fr : record.title_en],
          [t.explorer.teer, `TEER ${record.teer} · ${(t.teerLabels as Record<string, string>)[record.teer] ?? ""}`],
          [t.explorer.detail, record.broad_category],
          [t.explorer.source, t.explorer.sourceNoc],
        ]
      : record.table === "infractions"
        ? [
            [t.explorer.code, record.code],
            [t.explorer.titleLabel, record.description],
            [t.explorer.tickets, Number(record.tickets).toLocaleString(lang === "fr" ? "fr-CA" : "en-CA")],
            [t.explorer.totalFines, "$" + Number(record.total_fines).toLocaleString(lang === "fr" ? "fr-CA" : "en-CA")],
            [t.explorer.avgFine, "$" + Number(record.avg_fine).toFixed(2)],
            [t.explorer.source, t.explorer.sourceInf],
          ]
        : [
            [t.explorer.code, record.code],
            [t.explorer.titleLabel, lang === "fr" ? record.description_fr : record.description_en],
            [t.explorer.commodityType, record.commodity_type],
            [t.explorer.status, record.status],
            [t.explorer.source, t.explorer.sourceGsin],
          ];
  return (
    <div className="mt-6 overflow-hidden rounded-[24px] border border-line bg-paper" role="dialog" aria-label={record.code}>
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <code className="font-mono text-[18px] font-semibold">{record.code}</code>
        <button onClick={onClose} className="rounded-full border border-line px-4 py-1.5 text-[14px] font-medium hover:border-ink" aria-label="Close">
          ✕
        </button>
      </div>
      <dl className="px-6 py-5">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[160px_1fr] gap-4 border-b border-line/60 py-2.5 text-[15px] last:border-0">
            <dt className="text-ink/55">{k}</dt>
            <dd className="font-medium">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
