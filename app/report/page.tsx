"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ReportView, copyReportText, downloadReportText } from "@/components/ReportView";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import type { AnalysisReport, IdeaFormData } from "@/lib/types";

export default function ReportPage() {
  const router = useRouter();
  const [storedState, setStoredState] = useState<{
    report: AnalysisReport | null;
    form: IdeaFormData | null;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const report = storedState?.report ?? null;
  const form = storedState?.form ?? null;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storedReport = sessionStorage.getItem("ideacheck:report");
      const storedForm = sessionStorage.getItem("ideacheck:form");

      setStoredState({
        report: storedReport ? (JSON.parse(storedReport) as AnalysisReport) : null,
        form: storedForm ? (JSON.parse(storedForm) as IdeaFormData) : null
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function handleNewAnalysis() {
    sessionStorage.removeItem("ideacheck:report");
    sessionStorage.removeItem("ideacheck:form");
    router.push("/analyze");
  }

  async function handleCopy() {
    if (!report) {
      return;
    }

    await copyReportText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function handleDownload() {
    if (report) {
      downloadReportText(report, form);
    }
  }

  return (
    <main className="page-shell">
      <SiteHeader active="analyze" />
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
        {!storedState ? (
          <div className="paper-panel rounded-[24px] p-8 text-center">
            <p className="text-sm font-bold text-muted">Завантажуємо звіт...</p>
          </div>
        ) : report ? (
          <ReportView
            report={report}
            form={form}
            copied={copied}
            onCopy={handleCopy}
            onDownload={handleDownload}
            onNew={handleNewAnalysis}
          />
        ) : (
          <div className="paper-panel rounded-[28px] p-8 text-center">
            <h1 className="font-display text-5xl leading-tight text-emerald-950">Звіт ще не створено</h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted">
              Спочатку заповніть форму аналізу. Після генерації результат автоматично відкриється на цій сторінці.
            </p>
            <Link
              href="/analyze"
              className="btn-primary mt-7"
            >
              Перейти до аналізу
            </Link>
          </div>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
