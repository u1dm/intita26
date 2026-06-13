"use client";

import type { CSSProperties } from "react";
import { reportToText } from "@/lib/report";
import type { AnalysisReport, IdeaFormData } from "@/lib/types";
import { competitorTypeLabel, riskLevelLabel, scoreLabel } from "@/lib/labels";
import { slugify } from "@/lib/idea";

type ReportViewProps = {
  report: AnalysisReport;
  form?: IdeaFormData | null;
  copied: boolean;
  onCopy: () => void;
  onDownload: () => void;
  onNew: () => void;
};

export function ReportView({ report, copied, onCopy, onDownload, onNew }: ReportViewProps) {
  const cards = [
    ["Короткий опис", report.summary],
    ["Потенціал ринку", report.marketPotential],
    ["Бізнес-модель", report.businessModel],
    ["MVP", report.mvp],
    ["Підсумковий висновок", report.finalConclusion]
  ];
  const riskCounts = report.risks.reduce(
    (acc, risk) => {
      acc[risk.level] += 1;
      return acc;
    },
    { low: 0, medium: 0, high: 0 }
  );
  const verdict = getVerdict(report);

  return (
    <div className="grid min-w-0 gap-4 sm:gap-5">
      <div className="dark-surface motion-reveal rounded-[28px] p-1">
        <div className="relative z-10 flex min-w-0 flex-col gap-5 rounded-[24px] border border-white/14 bg-[#0b3329]/72 p-5 backdrop-blur sm:p-6 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="section-label text-[#dce7db]">Звіт з оцінки ідеї</p>
            <h1 className="font-display mt-3 max-w-3xl text-4xl leading-[1.04] tracking-normal text-[#f8f0df] sm:text-5xl">
              Рішення для першого обговорення
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#dce7db]">
              Використовуйте цей звіт як основу для рішення: продовжувати, звузити ідею або змінити курс до розробки.
            </p>
          </div>
          <div className="grid gap-2 sm:flex sm:flex-wrap md:justify-end">
            <button onClick={onCopy} className="btn-secondary h-10 w-full border-white/20 bg-white/8 px-4 text-[#f8f0df] hover:bg-white/14 sm:w-auto">
              {copied ? "Скопійовано" : "Скопіювати"}
            </button>
            <button onClick={onDownload} className="shine h-10 w-full rounded-full bg-[#fffdf6] px-4 text-sm font-bold text-emerald-950 hover:bg-white sm:w-auto">
              Завантажити .txt
            </button>
            <button onClick={onNew} className="btn-secondary h-10 w-full border-white/20 bg-white/8 px-4 text-[#f8f0df] hover:bg-white/14 sm:w-auto">
              Новий аналіз
            </button>
          </div>
        </div>
      </div>

      <section className={`motion-pop rounded-[26px] border p-5 sm:p-6 ${verdict.className}`}>
        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em]">{verdict.label}</p>
            <h2 className="font-display mt-3 text-4xl leading-tight sm:text-5xl">{verdict.title}</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7">{verdict.description}</p>
          </div>
          <div className="rounded-[22px] bg-white/54 p-4 text-center shadow-[0_18px_45px_rgba(11,51,41,0.08)]">
            <p className="font-display text-5xl leading-none">{report.scores.overall}</p>
            <p className="mt-2 text-xs font-black uppercase">з 10</p>
          </div>
        </div>
      </section>

      <section className="grid min-w-0 gap-4 sm:gap-5 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="premium-card motion-lift rounded-[24px] border border-emerald-900/20 bg-emerald-950 p-5 text-white sm:p-6">
          <p className="text-sm font-bold text-emerald-100">Інфографіка аналізу</p>
          <div className="mt-6 grid place-items-center">
            <ScoreGauge score={report.scores.overall} />
          </div>
          <p className="mt-5 text-sm leading-6 text-emerald-50">
            Загальна оцінка показує якість поточних припущень і готовність до першого пілоту.
          </p>
        </div>

        <div className="grid min-w-0 gap-4 sm:gap-5 md:grid-cols-2">
          <div className="paper-panel motion-lift rounded-[24px] p-5">
            <h2 className="text-sm font-black uppercase tracking-normal text-emerald-950">Оцінки напрямів</h2>
            <div className="mt-5 grid gap-4">
              {Object.entries(report.scores).map(([label, score]) => (
                <div key={label}>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <p className="text-sm font-bold text-ink">{scoreLabel(label)}</p>
                    <p className="text-sm font-black text-emerald-950">{score}/10</p>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-[#e6e0d4]">
                    <div className="animate-score h-full rounded-full bg-emerald-900" style={{ width: `${score * 10}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="paper-panel motion-lift rounded-[24px] p-5">
            <h2 className="text-sm font-black uppercase tracking-normal text-emerald-950">Карта ризиків</h2>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                ["Високі", riskCounts.high, "bg-red-50 text-red-700"],
                ["Середні", riskCounts.medium, "bg-amber-50 text-amber-700"],
                ["Низькі", riskCounts.low, "bg-emerald-50 text-emerald-700"]
              ].map(([label, count, className]) => (
                <div key={label} className={`rounded-2xl p-3 text-center sm:p-4 ${className}`}>
                  <p className="font-display text-3xl leading-none sm:text-4xl">{count}</p>
                  <p className="mt-2 text-[0.65rem] font-bold uppercase sm:text-xs">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl bg-[#fffdf6] p-4">
              <div className="grid grid-cols-5 gap-1">
                {Array.from({ length: 15 }).map((_, index) => {
                  const filled = index < Math.round((10 - report.scores.riskLevel) * 1.5);
                  return (
                    <span
                      key={index}
                      className={`motion-scale h-8 rounded-md transition ${filled ? "bg-emerald-900" : "bg-[#d8d4c8]"}`}
                    />
                  );
                })}
              </div>
              <p className="mt-3 text-xs leading-5 text-muted">Темні клітинки показують запас керованості ризиків.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid min-w-0 gap-4 sm:gap-5 lg:grid-cols-2">
        {cards.map(([title, text]) => (
          <InfoCard key={title} title={title}>
            <p>{text}</p>
          </InfoCard>
        ))}
      </div>

      <div className="grid min-w-0 gap-4 sm:gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <InfoCard title="Цільова аудиторія">
          <ul className="grid gap-3">
            {report.targetAudience.map((item) => (
              <li key={`${item.segment}-${item.needs}`} className="border-b border-line pb-3 last:border-0 last:pb-0">
                <p className="font-bold text-ink">{item.segment}</p>
                <p className="mt-1">{item.needs}</p>
              </li>
            ))}
          </ul>
        </InfoCard>

        <InfoCard title="Конкуренти">
          <div className="grid gap-3 md:hidden">
            {report.competitors.map((item) => (
              <article key={`${item.name}-${item.type}`} className="rounded-[16px] border border-line bg-[#fffdf6] p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <h3 className="font-bold text-ink">{item.name}</h3>
                  <span className="w-fit rounded-full bg-[#dce7db] px-3 py-1 text-xs font-bold text-emerald-950">
                    {competitorTypeLabel(item.type)}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">{item.description}</p>
              </article>
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr className="border-b border-line">
                  <th className="py-2 pr-4">Назва</th>
                  <th className="py-2 pr-4">Тип</th>
                  <th className="py-2">Опис</th>
                </tr>
              </thead>
              <tbody>
                {report.competitors.map((item) => (
                  <tr key={`${item.name}-${item.type}`} className="border-b border-line last:border-0">
                    <td className="py-3 pr-4 font-semibold text-ink">{item.name}</td>
                    <td className="py-3 pr-4 text-muted">{competitorTypeLabel(item.type)}</td>
                    <td className="py-3 text-muted">{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </InfoCard>
      </div>

      <InfoCard title="Ризики">
        <div className="grid gap-3 md:hidden">
          {report.risks.map((risk) => (
            <article key={risk.title} className="rounded-[16px] border border-line bg-[#fffdf6] p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <h3 className="font-bold text-ink">{risk.title}</h3>
                <span className={riskBadgeClass(risk.level)}>{riskLevelLabel(risk.level)}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">{risk.description}</p>
              <div className="mt-4 rounded-[14px] bg-[#fbf6eb] p-3">
                <p className="text-xs font-black uppercase text-emerald-950">Як зменшити</p>
                <p className="mt-2 text-sm leading-6 text-muted">{risk.mitigation}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr className="border-b border-line">
                <th className="py-2 pr-4">Ризик</th>
                <th className="py-2 pr-4">Рівень</th>
                <th className="py-2 pr-4">Опис</th>
                <th className="py-2">Як зменшити</th>
              </tr>
            </thead>
            <tbody>
              {report.risks.map((risk) => (
                <tr key={risk.title} className="border-b border-line last:border-0">
                  <td className="py-3 pr-4 font-semibold text-ink">{risk.title}</td>
                  <td className="py-3 pr-4">
                    <span className={riskBadgeClass(risk.level)}>{riskLevelLabel(risk.level)}</span>
                  </td>
                  <td className="py-3 pr-4 text-muted">{risk.description}</td>
                  <td className="py-3 text-muted">{risk.mitigation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </InfoCard>

      <div className="grid min-w-0 gap-4 sm:gap-5 lg:grid-cols-3">
        <InfoCard title="Джерела доходу">
          <BulletList items={report.revenueStreams} />
        </InfoCard>
        <InfoCard title="Рекомендації">
          <BulletList items={report.recommendations} />
        </InfoCard>
        <InfoCard title="Метрики успіху">
          <BulletList items={report.successMetrics} />
        </InfoCard>
      </div>

      <InfoCard title="Підсумкові оцінки">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Object.entries(report.scores).map(([label, score]) => (
            <div key={label} className="rounded-[16px] bg-[#fffdf6] p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-bold text-ink">{scoreLabel(label)}</p>
                <p className="text-sm font-black text-emerald-950">{score}/10</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#d8d4c8]">
                <div className="animate-score h-full rounded-full bg-emerald-900" style={{ width: `${score * 10}%` }} />
              </div>
            </div>
          ))}
        </div>
      </InfoCard>
    </div>
  );
}

export function copyReportText(report: AnalysisReport) {
  return navigator.clipboard.writeText(reportToText(report));
}

export function downloadReportText(report: AnalysisReport, form?: IdeaFormData | null) {
  const blob = new Blob([reportToText(report)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${slugify(form?.ideaName || "startup-analysis")}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="paper-panel motion-lift min-w-0 rounded-[22px] p-4 sm:p-5">
      <h2 className="text-sm font-black uppercase tracking-normal text-emerald-950">{title}</h2>
      <div className="mt-4 text-sm leading-6 text-muted">{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-900" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ScoreGauge({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 10) * circumference;

  return (
    <div className="relative h-32 w-32 sm:h-40 sm:w-40">
      <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="14" />
        <circle
          className="motion-gauge"
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="#d9fff2"
          strokeLinecap="round"
          strokeWidth="14"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={
            {
              "--gauge-length": circumference,
              "--gauge-offset": offset
            } as CSSProperties
          }
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="font-display text-4xl leading-none sm:text-5xl">{score}</p>
          <p className="mt-1 text-sm font-bold text-emerald-100">з 10</p>
        </div>
      </div>
    </div>
  );
}

function riskBadgeClass(level: "low" | "medium" | "high") {
  const base = "rounded-md px-2 py-1 text-xs font-bold uppercase";

  if (level === "high") {
    return `${base} bg-red-50 text-red-700`;
  }

  if (level === "medium") {
    return `${base} bg-amber-50 text-amber-700`;
  }

  return `${base} bg-emerald-50 text-emerald-700`;
}

function getVerdict(report: AnalysisReport) {
  const overall = report.scores.overall;
  const riskLevel = report.scores.riskLevel;
  const highRisks = report.risks.filter((risk) => risk.level === "high").length;

  if (overall >= 7.5 && riskLevel >= 6 && highRisks <= 1) {
    return {
      label: "Вердикт",
      title: "Запускати пілот",
      description:
        "Ідея виглядає достатньо зрілою для малого тесту. Наступний крок - швидкий MVP, перші платні користувачі та перевірка ключових ризиків на практиці.",
      className: "border-emerald-900/20 bg-[#e9f4e7] text-emerald-950"
    };
  }

  if (overall >= 5.5) {
    return {
      label: "Вердикт",
      title: "Звузити ідею перед запуском",
      description:
        "Потенціал є, але перед MVP варто сфокусувати аудиторію, спростити першу версію або зменшити ризики. Не масштабуйте ідею до короткої перевірки.",
      className: "border-amber-300/55 bg-[#fff7dc] text-[#4a3a08]"
    };
  }

  return {
    label: "Вердикт",
    title: "Не запускати зараз",
    description:
      "Ідея потребує суттєвого уточнення. Спершу перевірте проблему, платоспроможність аудиторії та конкурентну відмінність, а вже потім переходьте до MVP.",
    className: "border-red-200 bg-red-50 text-red-900"
  };
}
