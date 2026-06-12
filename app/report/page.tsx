"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { reportToText } from "@/lib/report";
import type { AnalysisReport } from "@/lib/types";

export default function ReportPage() {
  const router = useRouter();
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [formName, setFormName] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("ideacheck_report");
    const formStored = localStorage.getItem("ideacheck_form");
    if (!stored) {
      router.replace("/analyze");
      return;
    }
    try {
      const parsed = JSON.parse(stored) as AnalysisReport;
      setReport(parsed);
      if (formStored) {
        const form = JSON.parse(formStored) as { ideaName?: string };
        if (form.ideaName) setFormName(form.ideaName);
      }
    } catch {
      router.replace("/analyze");
    }
  }, [router]);

  const reportText = useMemo(() => (report ? reportToText(report) : ""), [report]);

  async function copyReport() {
    if (!reportText) return;
    await navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function downloadReport() {
    if (!reportText) return;
    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slugify(formName || "startup-analysis")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function newAnalysis() {
    localStorage.removeItem("ideacheck_report");
    localStorage.removeItem("ideacheck_form");
    router.push("/analyze");
  }

  if (!report) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-accent dark:border-slate-700" />
      </div>
    );
  }

  const s = report.scores;
  const overall = s.overall;
  const avgOthers = Math.round(
    (s.marketPotential + s.audienceClarity + s.competitiveness + s.mvpSimplicity + s.riskLevel) / 5
  );

  const riskCounts = { high: 0, medium: 0, low: 0 } as Record<string, number>;
  report.risks.forEach((r) => { riskCounts[r.level]++; });
  const totalRisks = report.risks.length;

  const directCount = report.competitors.filter((c) => c.type === "direct").length;
  const indirectCount = report.competitors.filter((c) => c.type === "indirect").length;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-16 dark:from-slate-900 dark:to-slate-900">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:px-10">

        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-sm font-black text-white shadow-lg shadow-brand/20">
                AI
              </div>
              <div>
                <h1 className="text-2xl font-bold text-ink dark:text-slate-100 sm:text-3xl">
                  {formName || "Детальний звіт"}
                </h1>
                <p className="mt-0.5 text-sm text-muted dark:text-slate-400">
                  Звіт згенеровано IdeaCheck AI
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={copyReport} className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold text-ink shadow-sm transition hover:border-brand hover:text-brand dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-brand dark:hover:text-brand">
              <ClipboardIcon /> {copied ? "Скопійовано" : "Скопіювати"}
            </button>
            <button onClick={downloadReport} className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold text-ink shadow-sm transition hover:border-brand hover:text-brand dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-brand dark:hover:text-brand">
              <DownloadIcon /> .txt
            </button>
            <button onClick={newAnalysis} className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0b3d68]">
              <PlusIcon /> Новий аналіз
            </button>
          </div>
        </div>

        <div className="mb-10 grid gap-4 sm:grid-cols-4">
          {[
            ["Загальна оцінка", `${overall}/10`, overallColor(overall), overallBg(overall)],
            ["Середня категорій", `${avgOthers}/10`, overallColor(avgOthers), overallBg(avgOthers)],
            ["Ризики", `${totalRisks} шт.`, "text-ink dark:text-slate-100", "bg-slate-50 dark:bg-slate-700/30"],
            ["Конкуренти", `${report.competitors.length} шт.`, "text-ink dark:text-slate-100", "bg-slate-50 dark:bg-slate-700/30"]
          ].map(([label, value, color, bg]) => (
            <div key={String(label)} className={`rounded-xl border border-line p-4 dark:border-slate-700 ${bg}`}>
              <p className="text-xs font-bold uppercase tracking-wide text-muted dark:text-slate-400">{label}</p>
              <p className={`mt-1 text-2xl font-black ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-8">

          <section className="rounded-2xl border border-line bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-8">
            <SectionTitle icon={<BulbIcon />}>Короткий опис</SectionTitle>
            <p className="mt-4 text-base leading-8 text-ink dark:text-slate-200">
              {report.summary}
            </p>
          </section>

          <section className="rounded-2xl border border-line bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-8">
            <SectionTitle icon={<TrendIcon />}>Потенціал ринку</SectionTitle>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Ринок", "Зростання", "Попит"].map((tag) => (
                <span key={tag} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-muted dark:bg-slate-700 dark:text-slate-400">
                  #{tag.toLowerCase()}
                </span>
              ))}
            </div>
            <p className="mt-4 text-base leading-8 text-ink dark:text-slate-200">{report.marketPotential}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                ["Оцінка потенціалу", `${s.marketPotential}/10`, s.marketPotential],
                ["Готовність ринку", `${Math.round(s.marketPotential * 0.8 + 1)}/10`, Math.round(s.marketPotential * 0.8 + 1)],
                ["Конкурентне вікно", `${Math.round(s.competitiveness * 0.7 + 2)}/10`, Math.round(s.competitiveness * 0.7 + 2)]
              ].map(([label, value, score]) => (
                <div key={String(label)} className="rounded-xl border border-line bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-700/20">
                  <p className="text-xs font-bold uppercase text-muted dark:text-slate-400">{label}</p>
                  <p className={`mt-1 text-lg font-black ${Number(score) >= 7 ? "text-emerald-600 dark:text-emerald-400" : Number(score) >= 5 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>
                    {value}
                  </p>
                  <MiniBar score={Number(score)} />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-8">
            <SectionTitle icon={<UsersIcon />}>
              Цільова аудиторія
              <span className="ml-2 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-muted dark:bg-slate-700 dark:text-slate-400">
                {report.targetAudience.length} сегменти
              </span>
            </SectionTitle>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              {report.targetAudience.map((item, i) => (
                <div key={i} className="group relative overflow-hidden rounded-xl border border-line bg-gradient-to-br from-white to-slate-50 p-5 transition hover:shadow-md dark:border-slate-700 dark:from-slate-800 dark:to-slate-800/50">
                  <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-brand/5 dark:bg-brand/10" />
                  <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand text-lg font-black text-white shadow-sm">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-bold text-ink dark:text-slate-100">{item.segment}</p>
                      <p className="mt-2 text-sm leading-6 text-muted dark:text-slate-400">{item.needs}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-xl border border-line bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-700/20">
              <p className="text-xs font-bold uppercase text-muted dark:text-slate-400">Оцінка чіткості аудиторії</p>
              <div className="mt-2 flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{ width: `${s.audienceClarity * 10}%` }}
                    />
                  </div>
                </div>
                <span className={`text-lg font-black ${s.audienceClarity >= 7 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                  {s.audienceClarity}/10
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-8">
            <SectionTitle icon={<ShieldIcon />}>
              Конкуренти
              <span className="ml-2 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-muted dark:bg-slate-700 dark:text-slate-400">
                {report.competitors.length} конкурентів
              </span>
            </SectionTitle>
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 dark:bg-red-900/20">
                <span className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-sm font-bold text-red-700 dark:text-red-400">{directCount} прямих</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 dark:bg-slate-700">
                <span className="h-3 w-3 rounded-full bg-slate-400" />
                <span className="text-sm font-bold text-muted dark:text-slate-400">{indirectCount} непрямих</span>
              </div>
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-line dark:border-slate-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line bg-slate-50 text-left dark:border-slate-700 dark:bg-slate-700/30">
                    <th className="px-5 py-3.5 text-xs font-bold uppercase text-muted dark:text-slate-400">Конкурент</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase text-muted dark:text-slate-400">Тип</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase text-muted dark:text-slate-400">Деталі</th>
                  </tr>
                </thead>
                <tbody>
                  {report.competitors.map((item, i) => (
                    <tr key={i} className="border-b border-line last:border-0 dark:border-slate-700">
                      <td className="px-5 py-4 font-bold text-ink dark:text-slate-100">{item.name}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold uppercase ${
                          item.type === "direct"
                            ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-slate-100 text-muted dark:bg-slate-700 dark:text-slate-400"
                        }`}>
                          {item.type === "direct" && <span className="h-1.5 w-1.5 rounded-full bg-red-500" />}
                          {item.type === "direct" ? "прямий" : "непрямий"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-muted dark:text-slate-400">{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-5 rounded-xl border border-line bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-700/20">
              <p className="text-xs font-bold uppercase text-muted dark:text-slate-400">Оцінка конкурентної позиції</p>
              <div className="mt-2 flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${s.competitiveness * 10}%`, background: s.competitiveness >= 7 ? "#10b981" : s.competitiveness >= 5 ? "#f59e0b" : "#ef4444" }}
                    />
                  </div>
                </div>
                <span className={`text-lg font-black ${s.competitiveness >= 7 ? "text-emerald-600 dark:text-emerald-400" : s.competitiveness >= 5 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>
                  {s.competitiveness}/10
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-8">
            <SectionTitle icon={<WarningIcon />}>
              Ризики
              <span className="ml-2 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-muted dark:bg-slate-700 dark:text-slate-400">
                {totalRisks} ризиків
              </span>
            </SectionTitle>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { level: "high", label: "Високі", count: riskCounts.high, color: "bg-red-500", bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-700 dark:text-red-400" },
                { level: "medium", label: "Середні", count: riskCounts.medium, color: "bg-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-700 dark:text-amber-400" },
                { level: "low", label: "Низькі", count: riskCounts.low, color: "bg-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400" }
              ].map((item) => (
                <div key={item.level} className={`rounded-xl ${item.bg} p-4 text-center`}>
                  <div className={`mx-auto mb-2 h-3 w-full max-w-[80px] rounded-full ${item.color}`} style={{ opacity: 0.6 }} />
                  <p className={`text-2xl font-black ${item.text}`}>{item.count}</p>
                  <p className={`text-xs font-bold uppercase ${item.text}`}>{item.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-4">
              {report.risks.map((risk, i) => (
                <div key={i} className="group rounded-xl border border-line p-5 transition hover:shadow-md dark:border-slate-700">
                  <div className="flex flex-wrap items-start gap-4">
                    <div className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl text-base font-bold text-white shadow-sm ${
                      risk.level === "high" ? "bg-red-500" : risk.level === "medium" ? "bg-amber-500" : "bg-emerald-500"
                    }`}>
                      {risk.level === "high" ? "!!" : risk.level === "medium" ? "!" : "✓"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-bold text-ink dark:text-slate-100">{risk.title}</p>
                        <span className={`rounded-lg px-2.5 py-0.5 text-xs font-bold ${
                          risk.level === "high"
                            ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : risk.level === "medium"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        }`}>
                          {riskLevelLabel(risk.level)}
                        </span>
                        <span className={`ml-auto text-xs font-bold ${risk.level === "high" ? "text-red-500" : risk.level === "medium" ? "text-amber-500" : "text-emerald-500"}`}>
                          {risk.level === "high" ? "пріоритет 1" : risk.level === "medium" ? "пріоритет 2" : "пріоритет 3"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted dark:text-slate-400">{risk.description}</p>
                      <div className="mt-4 flex items-start gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-700/20">
                        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-accent/10 text-xs font-bold text-accent">
                          <span>→</span>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase text-muted dark:text-slate-400">Рекомендація щодо зменшення</p>
                          <p className="mt-0.5 text-sm leading-6 text-ink dark:text-slate-200">{risk.mitigation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-line bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-700/20">
              <p className="text-xs font-bold uppercase text-muted dark:text-slate-400">Рівень ризику проекту</p>
              <div className="mt-2 flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${s.riskLevel * 10}%`, background: s.riskLevel >= 7 ? "#10b981" : s.riskLevel >= 5 ? "#f59e0b" : "#ef4444" }}
                    />
                  </div>
                </div>
                <span className={`text-lg font-black ${s.riskLevel >= 7 ? "text-emerald-600 dark:text-emerald-400" : s.riskLevel >= 5 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>
                  {s.riskLevel}/10
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-8">
            <SectionTitle icon={<BriefcaseIcon />}>Бізнес-модель</SectionTitle>
            <p className="mt-4 text-base leading-8 text-ink dark:text-slate-200">{report.businessModel}</p>

            <div className="mt-6">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-5 w-1 rounded-full bg-brand" />
                <h4 className="text-sm font-black uppercase text-brand">Джерела доходу</h4>
                <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-muted dark:bg-slate-700 dark:text-slate-400">
                  {report.revenueStreams.length} джерел
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {report.revenueStreams.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-xl border border-line bg-white p-4 transition hover:shadow-sm dark:border-slate-700 dark:bg-slate-800">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent to-emerald-500 text-sm font-bold text-white shadow-sm">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-ink dark:text-slate-100">{item}</p>
                      <p className="text-xs text-muted dark:text-slate-400">
                        {i === 0 ? "основний" : i === 1 ? "додатковий" : "перспективний"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-8">
            <SectionTitle icon={<RocketIcon />}>MVP</SectionTitle>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-bold text-accent">Фаза 1: Тестування</span>
              <span className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">Фаза 2: Запуск</span>
              <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-muted dark:bg-slate-700 dark:text-slate-400">Фаза 3: Масштаб</span>
            </div>
            <p className="mt-4 text-base leading-8 text-ink dark:text-slate-200">{report.mvp}</p>
            <div className="mt-5 rounded-xl border border-line bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-700/20">
              <div className="flex items-center gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent/10 text-sm font-bold text-accent">
                  <ClockIcon />
                </div>
                <p className="text-sm text-muted dark:text-slate-400">
                  <span className="font-bold text-ink dark:text-slate-100">Рекомендований термін MVP:</span> 2-4 тижні для ручного пілоту, 6-8 тижнів для автоматизованої версії
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-8">
            <SectionTitle icon={<ChecklistIcon />}>
              Рекомендації
              <span className="ml-2 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-muted dark:bg-slate-700 dark:text-slate-400">
                {report.recommendations.length} кроків
              </span>
            </SectionTitle>
            <ol className="mt-4 grid gap-3">
              {report.recommendations.map((item, i) => (
                <li key={i} className="flex gap-4 rounded-xl border border-line bg-white p-4 transition hover:shadow-sm dark:border-slate-700 dark:bg-slate-800">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-accent text-sm font-bold text-white shadow-sm">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="pt-0.5 text-sm leading-6 text-ink dark:text-slate-200">{item}</p>
                    <p className="mt-1 text-xs text-muted dark:text-slate-400">
                      {i < 2 ? "пріоритет: високий" : i < 4 ? "пріоритет: середній" : "пріоритет: низький"}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-2xl border border-line bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-8">
            <SectionTitle icon={<ChartIcon />}>
              Метрики успіху
              <span className="ml-2 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-muted dark:bg-slate-700 dark:text-slate-400">
                {report.successMetrics.length} метрик
              </span>
            </SectionTitle>
            <p className="mt-1 text-sm text-muted dark:text-slate-400">
              Ключові показники для відстеження прогресу проекту
            </p>
            <div className="mt-4 grid gap-3">
              {report.successMetrics.map((item, i) => (
                <div key={i} className="flex items-start gap-4 rounded-xl border border-line bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-700/20">
                  <div className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold text-white ${
                    i < 2 ? "bg-emerald-500" : i < 4 ? "bg-accent" : "bg-slate-400"
                  }`}>
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-6 text-ink dark:text-slate-200">{item}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${Math.max(10, 100 - i * 15)}%`, background: i < 2 ? "#10b981" : i < 4 ? "#0f9f8f" : "#94a3b8" }}
                        />
                      </div>
                      <span className="text-xs font-bold text-muted dark:text-slate-400">ціль: {Math.max(60, 100 - i * 10)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-8">
            <SectionTitle icon={<StarIcon />}>Підсумкові оцінки</SectionTitle>

            <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
              <div>
                <p className="text-sm font-bold text-ink dark:text-slate-100">Радар оцінок</p>
                <p className="text-xs text-muted dark:text-slate-400">
                  Візуалізація сильних та слабких сторін проекту
                </p>
                <div className="mt-4">
                  <RadarChart scores={[s.marketPotential, s.audienceClarity, s.competitiveness, s.mvpSimplicity, s.riskLevel]} />
                </div>
              </div>
              <div className="grid gap-3">
                {(Object.entries(s) as [string, number][]).map(([label, score]) => (
                  <div key={label} className="rounded-xl border border-line bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-700/20">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-bold text-ink dark:text-slate-100">{scoreLabel(label)}</p>
                      <p className={`text-lg font-black ${
                        score >= 8 ? "text-emerald-600 dark:text-emerald-400" :
                        score >= 5 ? "text-amber-600 dark:text-amber-400" :
                        "text-red-600 dark:text-red-400"
                      }`}>
                        {score}<span className="text-xs text-muted dark:text-slate-400">/10</span>
                      </p>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${score * 10}%`, background: score >= 8 ? "#10b981" : score >= 5 ? "#f59e0b" : "#ef4444" }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted dark:text-slate-400">
                      {score >= 8 ? "відмінно" : score >= 5 ? "задовільно" : "потребує уваги"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border-2 border-brand/20 bg-gradient-to-br from-brand/5 to-brand/10 p-6 dark:border-brand/30 dark:from-brand/10 dark:to-brand/5 sm:p-8">
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                <div className="relative">
                  <svg className="h-28 w-28 -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="8" className="text-brand/20" />
                    <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray={`${overall * 31.4} 314`} strokeLinecap="round" className="text-brand" />
                  </svg>
                  <div className="absolute inset-0 grid place-items-center">
                    <span className={`text-3xl font-black ${overallColor}`}>{overall}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xl font-black text-brand">Загальна оцінка</p>
                  <p className="mt-1 text-sm text-muted dark:text-slate-400">
                    {overall >= 8 ? "Ідея має високий потенціал. Рекомендується перейти до фази MVP." :
                     overall >= 5 ? "Ідея потребує доопрацювання. Зверніть увагу на слабкі категорії." :
                     "Ідея потребує суттєвих змін або переосмислення."}
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <ScoreDot color={overall >= 7 ? "bg-emerald-500" : overall >= 5 ? "bg-amber-500" : "bg-red-500"} />
                    <span className="text-sm text-muted dark:text-slate-400">
                      {overall >= 8 ? "Високий потенціал" : overall >= 5 ? "Середній потенціал" : "Низький потенціал"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-brand to-blue-800 p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-2">
              <span className="text-lg">📌</span>
              <p className="text-sm font-black uppercase tracking-wider text-blue-200">Підсумковий висновок</p>
            </div>
            <p className="mt-4 text-base leading-8 text-blue-50">
              {report.finalConclusion}
            </p>
            <div className="mt-6 border-t border-white/20 pt-6">
              <p className="text-sm text-blue-200">
                <span className="font-bold text-white">Наступний крок:</span> Заповніть форму знову або доопрацюйте ідею на основі рекомендацій вище.
              </p>
            </div>
          </section>

          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <button onClick={copyReport} className="flex items-center gap-2 rounded-xl border border-line bg-white px-6 py-3 text-sm font-bold text-ink shadow-sm transition hover:border-brand hover:text-brand dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-brand dark:hover:text-brand">
              <ClipboardIcon /> {copied ? "Скопійовано" : "Скопіювати звіт"}
            </button>
            <button onClick={downloadReport} className="flex items-center gap-2 rounded-xl border border-line bg-white px-6 py-3 text-sm font-bold text-ink shadow-sm transition hover:border-brand hover:text-brand dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-brand dark:hover:text-brand">
              <DownloadIcon /> Завантажити .txt
            </button>
            <button onClick={newAnalysis} className="flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0b3d68]">
              <PlusIcon /> Новий аналіз
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function SectionTitle({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <h2 className="flex flex-wrap items-center gap-2 text-lg font-bold text-ink dark:text-slate-100">
      {icon ? <span className="text-brand">{icon}</span> : <span className="h-6 w-1 rounded-full bg-accent" />}
      {children}
    </h2>
  );
}

function MiniBar({ score }: { score: number }) {
  return (
    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600">
      <div
        className="h-full rounded-full"
        style={{ width: `${score * 10}%`, background: score >= 7 ? "#10b981" : score >= 5 ? "#f59e0b" : "#ef4444" }}
      />
    </div>
  );
}

function RadarChart({ scores }: { scores: number[] }) {
  const labels = ["Ринок", "Аудиторія", "Конкуренти", "MVP", "Ризики"];
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const r = 80;
  const levels = [2, 4, 6, 8, 10];
  const angleStep = (2 * Math.PI) / scores.length;
  const offset = -Math.PI / 2;

  function point(index: number, radius: number) {
    const angle = offset + index * angleStep;
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  }

  function polygon(radius: number) {
    return scores.map((_, i) => point(i, radius)).map((p) => `${p.x},${p.y}`).join(" ");
  }

  const dataPolygon = scores.map((score, i) => point(i, (score / 10) * r)).map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[240px] mx-auto">
      {levels.map((level) => (
        <polygon key={level} points={polygon((level / 10) * r)} fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-200 dark:text-slate-600" />
      ))}
      {scores.map((_, i) => {
        const p = point(i, r);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="currentColor" strokeWidth="1" className="text-slate-200 dark:text-slate-600" />;
      })}
      <polygon points={dataPolygon} fill="rgba(15, 76, 129, 0.2)" stroke="#0f4c81" strokeWidth="2" />
      {scores.map((score, i) => {
        const p = point(i, (score / 10) * r);
        return <circle key={i} cx={p.x} cy={p.y} r="4" fill="#0f4c81" className="drop-shadow-sm" />;
      })}
      {scores.map((score, i) => {
        const p = point(i, r + 18);
        return (
          <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" className="fill-muted text-[10px] font-bold dark:fill-slate-400">
            {labels[i]}
          </text>
        );
      })}
    </svg>
  );
}

function ScoreDot({ color }: { color: string }) {
  return <span className={`h-2.5 w-2.5 rounded-full ${color}`} />;
}

function overallColor(score: number) {
  return score >= 8 ? "text-emerald-600 dark:text-emerald-400" : score >= 5 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400";
}

function overallBg(score: number) {
  return score >= 8 ? "bg-emerald-50 dark:bg-emerald-900/30" : score >= 5 ? "bg-amber-50 dark:bg-amber-900/30" : "bg-red-50 dark:bg-red-900/30";
}

function riskLevelLabel(level: "low" | "medium" | "high") {
  return { low: "низький", medium: "середній", high: "високий" }[level];
}

function scoreLabel(label: string) {
  const labels: Record<string, string> = {
    marketPotential: "Потенціал ринку",
    audienceClarity: "Чіткість аудиторії",
    competitiveness: "Конкурентність",
    mvpSimplicity: "Простота MVP",
    riskLevel: "Рівень ризику",
    overall: "Загальна оцінка"
  };
  return labels[label] || label;
}

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9а-яіїєґ]+/gi, "-")
      .replace(/^-+|-+$/g, "") || "startup-analysis"
  );
}

function BulbIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M9 18h6M10 22h4M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  );
}

function TrendIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function RocketIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

function ChecklistIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
