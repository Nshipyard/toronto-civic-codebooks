"use client";

import { useLang } from "@/i18n";

// TEER distribution computed from data/noc_2021.csv (2026-10-08).
const TEER_COUNTS: { teer: string; count: number }[] = [
  { teer: "0", count: 48 },
  { teer: "1", count: 97 },
  { teer: "2", count: 162 },
  { teer: "3", count: 69 },
  { teer: "4", count: 95 },
  { teer: "5", count: 45 },
];
const TEER_MAX = 162;

export default function Showcase() {
  const { t, lang } = useLang();
  const titleFor = (d: { resolved: string; resolvedFr: string }) => (lang === "fr" ? d.resolved : d.resolved);
  return (
    <section id="showcase" className="bg-paper">
      <div className="mx-auto max-w-[1392px] px-6 py-20 md:py-28">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-canada">{t.showcase.kicker}</p>
        <h2 className="display mt-4 max-w-[720px] text-[40px] md:text-[52px]">{t.showcase.title}</h2>
        <p className="mt-5 max-w-[720px] text-[18px] leading-relaxed text-ink/70">{t.showcase.body}</p>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {t.showcase.demos.map((d) => (
            <article key={d.raw} className="overflow-hidden rounded-[24px] border border-line">
              <div className="border-b border-line bg-paper-warm px-6 py-5">
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink/50">{t.showcase.before}</p>
                <code className="display mt-2 block text-[44px]">{d.raw}</code>
                <p className="mt-1 text-[14px] text-ink/60">{d.rawLabel}</p>
              </div>
              <div className="bg-ink px-6 py-5 text-white">
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-white/50">{t.showcase.after}</p>
                <p className="mt-2 text-[20px] font-semibold leading-snug">{titleFor(d)}</p>
                <p className="mt-2 text-[14px] text-white/65">{d.extra}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-14 rounded-[24px] border border-line bg-paper-warm p-6 md:p-10">
          <h3 className="display text-[28px] md:text-[34px]">{t.showcase.teerTitle}</h3>
          <p className="mt-3 max-w-[680px] text-[16px] leading-relaxed text-ink/70">{t.showcase.teerBody}</p>
          <div className="mt-8 space-y-3">
            {TEER_COUNTS.map(({ teer, count }) => (
              <div key={teer} className="grid grid-cols-[minmax(0,220px)_minmax(0,1fr)_auto] items-center gap-4">
                <p className="truncate text-[14px] text-ink/70">
                  <span className="mr-2 font-mono font-semibold text-ink">TEER {teer}</span>
                  {(t.teerLabels as Record<string, string>)[teer]}
                </p>
                <div className="h-4 overflow-hidden rounded-full bg-ink/10">
                  <div className="h-full rounded-full bg-canada" style={{ width: `${(count / TEER_MAX) * 100}%` }} />
                </div>
                <p className="text-right font-mono text-[14px] font-semibold">{count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
