"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { reportToText } from "@/lib/report";
import type { AnalysisReport, IdeaFormData } from "@/lib/types";

const emptyForm: IdeaFormData = {
  ideaName: "",
  description: "",
  location: "",
  targetAudience: "",
  problem: "",
  monetization: "",
  competitors: "",
  resources: ""
};

const exampleForm: IdeaFormData = {
  ideaName: "Сервіс оренди павербанків для студентів",
  description:
    "Мобільний застосунок і мережа станцій в університетах, де студенти можуть орендувати павербанк на кілька годин.",
  location: "Вінниця, Україна",
  targetAudience: "Студенти, викладачі, відвідувачі кампусу",
  problem: "У людей часто розряджається телефон під час занять або пересування кампусом.",
  monetization: "Погодинна оплата, підписка, партнерства з університетами",
  competitors: "Власні павербанки, зарядні станції, сервіси оренди павербанків у ТРЦ",
  resources: "Невелика студентська команда, обмежений бюджет, 24-годинний хакатонний прототип"
};

const loadingMessages = [
  "Аналізуємо ідею...",
  "Перевіряємо ризики...",
  "Оцінюємо бізнес-модель...",
  "Готуємо звіт..."
];

const fields: {
  name: keyof IdeaFormData;
  label: string;
  placeholder: string;
  multiline?: boolean;
}[] = [
  {
    name: "ideaName",
    label: "Назва ідеї",
    placeholder: "Наприклад: сервіс оренди павербанків для студентів"
  },
  {
    name: "description",
    label: "Опис",
    placeholder: "Коротко опишіть продукт, як він працює і для кого.",
    multiline: true
  },
  {
    name: "location",
    label: "Місто / країна",
    placeholder: "Вінниця, Україна"
  },
  {
    name: "targetAudience",
    label: "Цільова аудиторія",
    placeholder: "Хто буде користуватися рішенням?"
  },
  {
    name: "problem",
    label: "Проблема",
    placeholder: "Який біль або задачу розв'язує ідея?",
    multiline: true
  },
  {
    name: "monetization",
    label: "Монетизація",
    placeholder: "Погодинна оплата, підписка, партнерства..."
  },
  {
    name: "competitors",
    label: "Конкуренти",
    placeholder: "Прямі та непрямі альтернативи"
  },
  {
    name: "resources",
    label: "Ресурси команди",
    placeholder: "Команда, бюджет, обмеження, терміни",
    multiline: true
  }
];

export default function Home() {
  const [form, setForm] = useState<IdeaFormData>(emptyForm);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadingText = useLoadingMessage(loading);
  const reportText = useMemo(() => (report ? reportToText(report) : ""), [report]);

  function updateField(name: keyof IdeaFormData, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  }

  function fillExample() {
    setForm(exampleForm);
    setReport(null);
    setError("");
    document.getElementById("idea-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCopied(false);

    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Не вдалося сформувати звіт.");
      }

      setReport(data);
      setTimeout(() => {
        document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Не вдалося сформувати звіт.");
    } finally {
      setLoading(false);
    }
  }

  async function copyReport() {
    if (!reportText) {
      return;
    }

    await navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function downloadReport() {
    if (!reportText) {
      return;
    }

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slugify(form.ideaName || "startup-analysis")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function newAnalysis() {
    setForm(emptyForm);
    setReport(null);
    setError("");
    setCopied(false);
    document.getElementById("top")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main id="top" className="min-h-screen bg-slate-50">
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid min-h-[620px] max-w-7xl items-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-10 lg:py-14">
          <div className="max-w-2xl">
            <div className="mb-8 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand text-sm font-black text-white">
                AI
              </div>
              <span className="text-lg font-bold text-ink">IdeaCheck AI</span>
            </div>

            <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-normal text-ink sm:text-5xl">
              Швидка первинна оцінка бізнес-ідеї перед запуском
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
              Початківцям складно зрозуміти, чи варто витрачати час на ідею. Сервіс збирає ключові
              дані й за хвилину формує зрозумілий звіт для пітчу, обговорення з командою та демо перед журі.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#idea-form"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-brand px-6 text-sm font-bold text-white shadow-soft transition hover:bg-[#0b3d68]"
              >
                Проаналізувати ідею
              </a>
              <button
                type="button"
                onClick={fillExample}
                className="inline-flex h-12 items-center justify-center rounded-lg border border-line bg-white px-6 text-sm font-bold text-brand transition hover:border-brand hover:bg-slate-50"
              >
                Заповнити прикладом
              </button>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                ["Фокус", "Тільки головні гіпотези та ризики"],
                ["Швидкість", "Демо працює навіть без API-ключа"],
                ["Результат", "Звіт можна скопіювати або завантажити"]
              ].map(([title, text]) => (
                <div key={title} className="rounded-lg border border-line bg-slate-50 p-4">
                  <p className="text-sm font-bold text-ink">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-line bg-slate-50 p-3 shadow-soft">
            <div className="rounded-lg border border-line bg-white p-5">
              <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
                <div>
                  <p className="text-sm font-bold text-ink">Звіт перевірки стартапу</p>
                  <p className="mt-1 text-xs text-muted">Ринок, аудиторія, ризики, MVP, оцінки</p>
                </div>
                <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-accent">7.2 / 10</div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  ["Потенціал ринку", "Є можливість для локального пілоту"],
                  ["Цільова аудиторія", "Студенти та відвідувачі кампусу"],
                  ["Ризики", "Готовність платити та операції"],
                  ["MVP", "Ручний пілот із формою заявки"]
                ].map(([title, text]) => (
                  <div key={title} className="rounded-lg border border-line bg-white p-4">
                    <p className="text-sm font-bold text-ink">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-lg bg-brand p-5 text-white">
                <p className="text-sm font-bold">Підсумковий висновок</p>
                <p className="mt-2 text-sm leading-6 text-blue-50">
                  Хороший хакатонний MVP, якщо команда рано перевірить готовність платити й звузить перший запуск.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-10">
        <form
          id="idea-form"
          onSubmit={handleSubmit}
          className="rounded-xl border border-line bg-white p-5 shadow-soft sm:p-6"
        >
          <div className="flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-ink">Дані для аналізу</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Заповніть поля достатньо конкретно, щоб звіт був корисним для ухвалення рішення.
              </p>
            </div>
            <button
              type="button"
              onClick={fillExample}
              className="h-10 rounded-lg border border-line bg-white px-4 text-sm font-bold text-brand transition hover:border-brand hover:bg-slate-50"
            >
              Заповнити прикладом
            </button>
          </div>

          <div className="mt-5 grid gap-4">
            {fields.map((field) => (
              <label key={field.name} className="block">
                <span className="text-sm font-bold text-ink">{field.label}</span>
                {field.multiline ? (
                  <textarea
                    value={form[field.name]}
                    onChange={(event) => updateField(field.name, event.target.value)}
                    placeholder={field.placeholder}
                    rows={field.name === "description" ? 4 : 3}
                    className="mt-2 w-full resize-y rounded-lg border border-line bg-white px-4 py-3 text-sm leading-6 text-ink outline-none transition placeholder:text-slate-400 focus:border-accent focus:ring-4 focus:ring-teal-50"
                  />
                ) : (
                  <input
                    value={form[field.name]}
                    onChange={(event) => updateField(field.name, event.target.value)}
                    placeholder={field.placeholder}
                    className="mt-2 h-11 w-full rounded-lg border border-line bg-white px-4 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-accent focus:ring-4 focus:ring-teal-50"
                  />
                )}
              </label>
            ))}
          </div>

          {error ? (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 h-12 w-full rounded-lg bg-accent px-6 text-sm font-bold text-white transition hover:bg-[#0b877a] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? loadingText : "Згенерувати аналіз"}
          </button>
        </form>

        <div id="result" className="min-h-[520px]">
          {loading ? <LoadingPanel message={loadingText} /> : null}
          {!loading && report ? (
            <ReportView report={report} copied={copied} onCopy={copyReport} onDownload={downloadReport} onNew={newAnalysis} />
          ) : null}
          {!loading && !report ? <EmptyReportState /> : null}
        </div>
      </section>
    </main>
  );
}

function ReportView({
  report,
  copied,
  onCopy,
  onDownload,
  onNew
}: {
  report: AnalysisReport;
  copied: boolean;
  onCopy: () => void;
  onDownload: () => void;
  onNew: () => void;
}) {
  const cards = [
    ["Короткий опис", report.summary],
    ["Потенціал ринку", report.marketPotential],
    ["Бізнес-модель", report.businessModel],
    ["MVP", report.mvp],
    ["Підсумковий висновок", report.finalConclusion]
  ];

  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-soft sm:p-6">
      <div className="flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ink">Готовий звіт</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Структурована первинна оцінка для демо й обговорення.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={onCopy} className="rounded-lg border border-line px-3 py-2 text-sm font-bold text-brand hover:border-brand">
            {copied ? "Скопійовано" : "Скопіювати"}
          </button>
          <button onClick={onDownload} className="rounded-lg border border-line px-3 py-2 text-sm font-bold text-brand hover:border-brand">
            Завантажити .txt
          </button>
          <button onClick={onNew} className="rounded-lg bg-brand px-3 py-2 text-sm font-bold text-white hover:bg-[#0b3d68]">
            Новий аналіз
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        {cards.map(([title, text]) => (
          <InfoCard key={title} title={title}>
            <p>{text}</p>
          </InfoCard>
        ))}

        <InfoCard title="Цільова аудиторія">
          <div className="grid gap-3 sm:grid-cols-2">
            {report.targetAudience.map((item) => (
              <div key={`${item.segment}-${item.needs}`} className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm font-bold text-ink">{item.segment}</p>
                <p className="mt-1 text-sm leading-6 text-muted">{item.needs}</p>
              </div>
            ))}
          </div>
        </InfoCard>

        <InfoCard title="Конкуренти">
          <div className="grid gap-3">
            {report.competitors.map((item) => (
              <div key={`${item.name}-${item.type}`} className="rounded-lg border border-line p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold text-ink">{item.name}</p>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold uppercase text-muted">
                    {competitorTypeLabel(item.type)}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </InfoCard>

        <InfoCard title="Ризики">
          <div className="grid gap-3">
            {report.risks.map((risk) => (
              <div key={risk.title} className="rounded-lg border border-line p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold text-ink">{risk.title}</p>
                  <span className={riskBadgeClass(risk.level)}>{riskLevelLabel(risk.level)}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">{risk.description}</p>
                <p className="mt-2 text-sm leading-6 text-ink">
                  <span className="font-bold">Як зменшити:</span> {risk.mitigation}
                </p>
              </div>
            ))}
          </div>
        </InfoCard>

        <InfoCard title="Джерела доходу">
          <BulletList items={report.revenueStreams} />
        </InfoCard>

        <InfoCard title="Рекомендації">
          <BulletList items={report.recommendations} />
        </InfoCard>

        <InfoCard title="Метрики успіху">
          <BulletList items={report.successMetrics} />
        </InfoCard>

        <InfoCard title="Підсумкові оцінки">
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(report.scores).map(([label, score]) => (
              <div key={label} className="rounded-lg bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-bold text-ink">{scoreLabel(label)}</p>
                  <p className="text-sm font-black text-brand">{score}/10</p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${score * 10}%` }} />
                </div>
              </div>
            ))}
          </div>
        </InfoCard>
      </div>
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-white p-4">
      <h3 className="text-sm font-black uppercase tracking-normal text-brand">{title}</h3>
      <div className="mt-3 text-sm leading-6 text-muted">{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-sm leading-6 text-muted">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function EmptyReportState() {
  return (
    <div className="flex min-h-[520px] items-center justify-center rounded-xl border border-dashed border-line bg-white p-8 text-center">
      <div>
        <p className="text-xl font-bold text-ink">Звіт з&apos;явиться тут</p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
          Заповніть форму або використайте демо-приклад. Після аналізу тут будуть картки з ринком, ризиками, MVP,
          рекомендаціями та оцінками.
        </p>
      </div>
    </div>
  );
}

function LoadingPanel({ message }: { message: string }) {
  return (
    <div className="flex min-h-[520px] items-center justify-center rounded-xl border border-line bg-white p-8 shadow-soft">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-accent" />
        <p className="mt-5 text-lg font-bold text-ink">{message}</p>
        <p className="mt-2 text-sm text-muted">Зазвичай це займає кілька секунд.</p>
      </div>
    </div>
  );
}

function useLoadingMessage(loading: boolean) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!loading) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % loadingMessages.length);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [loading]);

  return loading ? loadingMessages[index] : loadingMessages[0];
}

function validateForm(form: IdeaFormData): string {
  const shortField = fields.find((field) => form[field.name].trim().length < 3);

  if (shortField) {
    return `Поле "${shortField.label}" занадто коротке. Додайте більше деталей.`;
  }

  if (form.description.trim().length < 25) {
    return "Опис занадто короткий. Опишіть ідею хоча б одним повним реченням.";
  }

  if (form.problem.trim().length < 15) {
    return "Опис проблеми занадто короткий. Уточніть реальний біль користувача.";
  }

  return "";
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

function riskLevelLabel(level: "low" | "medium" | "high") {
  const labels = {
    low: "низький",
    medium: "середній",
    high: "високий"
  };

  return labels[level];
}

function competitorTypeLabel(type: "direct" | "indirect") {
  return type === "direct" ? "прямий" : "непрямий";
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
