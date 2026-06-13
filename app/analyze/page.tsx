"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ANALYSIS_PRICE, canRunAnalysis, getCurrentAccount, savePaidAnalysis, topUpCurrentAccount } from "@/lib/account";
import { logUserAction } from "@/lib/clientLogger";
import { emptyForm, exampleForms, formFields, validateForm } from "@/lib/idea";
import type { AnalysisReport, DemoAccount, IdeaFormData } from "@/lib/types";

const loadingMessages = [
  "Аналізуємо ідею...",
  "Перевіряємо ризики...",
  "Оцінюємо бізнес-модель...",
  "Готуємо звіт..."
];

export default function AnalyzePage() {
  const router = useRouter();
  const [form, setForm] = useState<IdeaFormData>(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState<DemoAccount | null>(null);
  const loadingText = useLoadingMessage(loading);

  useEffect(() => {
    function syncAccount() {
      setAccount(getCurrentAccount());
    }

    syncAccount();
    window.addEventListener("ideacheck:account-change", syncAccount);
    window.addEventListener("storage", syncAccount);

    return () => {
      window.removeEventListener("ideacheck:account-change", syncAccount);
      window.removeEventListener("storage", syncAccount);
    };
  }, []);

  function updateField(name: keyof IdeaFormData, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  }

  function fillExample() {
    const randomIndex = Math.floor(Math.random() * exampleForms.length);
    setForm(exampleForms[randomIndex]);
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!account) {
      setError("Спочатку створіть аккаунт у кабінеті, щоб зберігати історію аналізів.");
      return;
    }

    if (!canRunAnalysis(account)) {
      setError(`На балансі має бути щонайменше $${ANALYSIS_PRICE}. Поповніть демо-баланс у кабінеті.`);
      return;
    }

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
      const data = (await response.json()) as AnalysisReport | { error?: string };

      if (!response.ok) {
        throw new Error("error" in data && data.error ? data.error : "Не вдалося сформувати звіт.");
      }

      const report = data as AnalysisReport;
      const updatedAccount = savePaidAnalysis(form, report);
      if (!updatedAccount) {
        throw new Error("Не вдалося списати оплату за аналіз. Перевірте баланс у кабінеті.");
      }

      logUserAction({
        event: "startup_analyzed",
        account: {
          id: updatedAccount.id,
          name: updatedAccount.name,
          email: updatedAccount.email
        },
        details: {
          cost: ANALYSIS_PRICE,
          balanceAfter: updatedAccount.balance,
          form,
          scores: report.scores,
          verdictScore: report.scores.overall
        }
      });

      setAccount(updatedAccount);
      sessionStorage.setItem("ideacheck:form", JSON.stringify(form));
      sessionStorage.setItem("ideacheck:report", JSON.stringify(report));
      router.push("/report");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Не вдалося сформувати звіт.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <SiteHeader active="analyze" />
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:px-10">
        <aside className="dark-surface motion-reveal rounded-[28px] p-7 lg:sticky lg:top-24 lg:self-start">
          <div className="relative z-10">
            <p className="section-label text-[#dce7db]">Сторінка аналізу</p>
            <h1 className="font-display mt-4 text-5xl leading-tight text-[#f8f0df]">Заповніть дані про бізнес-ідею</h1>
            <p className="mt-5 text-sm leading-7 text-[#dce7db]">
            Чим конкретніші відповіді, тим кориснішим буде звіт. Не потрібно писати бізнес-план: достатньо коротко
            описати проблему, аудиторію, конкурентів і ресурси.
            </p>
            <div className="mt-10 grid gap-3 border-t border-white/18 pt-6">
              {[
                `вартість аналізу $${ANALYSIS_PRICE}`,
                account ? `баланс ${account.balance.toFixed(2)}$` : "потрібен аккаунт",
                "історія звітів у кабінеті"
              ].map((item) => (
                <div key={item} className="flex gap-3 text-sm leading-6 text-[#f4f1e8]">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#dce7db]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <form onSubmit={handleSubmit} className="paper-panel motion-reveal-slow rounded-[28px] p-5 sm:p-7">
          <div className="flex flex-col gap-3 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-4xl leading-tight text-emerald-950">Дані для аналізу</h2>
              <p className="mt-2 text-sm text-muted">Усі поля потрібні для якісної первинної оцінки.</p>
            </div>
            <button type="button" onClick={fillExample} className="btn-secondary h-10 px-4">
              Заповнити прикладом
            </button>
          </div>

          <div className="mt-6 grid gap-5">
            {formFields.map((field) => (
              <label key={field.name} className="block">
                <span className="text-sm font-bold text-emerald-950">{field.label}</span>
                {field.multiline ? (
                  <textarea
                    value={form[field.name]}
                    onChange={(event) => updateField(field.name, event.target.value)}
                    placeholder={field.placeholder}
                    rows={field.name === "description" ? 5 : 3}
                    className="focus-ring mt-2 w-full resize-y rounded-[14px] border border-line bg-[#fffdf6] px-4 py-3 text-base leading-6 text-ink placeholder:text-muted/60 hover:bg-white"
                  />
                ) : (
                  <input
                    value={form[field.name]}
                    onChange={(event) => updateField(field.name, event.target.value)}
                    placeholder={field.placeholder}
                    className="focus-ring mt-2 h-12 w-full rounded-[14px] border border-line bg-[#fffdf6] px-4 text-base text-ink placeholder:text-muted/60 hover:bg-white"
                  />
                )}
              </label>
            ))}
          </div>

          {error ? (
            <div className="mt-5 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              <p>{error}</p>
              {!account ? (
                <button type="button" onClick={() => router.push("/account")} className="mt-3 font-bold text-red-800 underline underline-offset-4">
                  Перейти до кабінету
                </button>
              ) : !canRunAnalysis(account) ? (
                <button
                  type="button"
                  onClick={() => {
                    const updated = topUpCurrentAccount(5);
                    setAccount(updated);
                    setError("");
                  }}
                  className="mt-3 font-bold text-red-800 underline underline-offset-4"
                >
                  Поповнити демо-баланс на $5
                </button>
              ) : null}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="shine mt-7 h-12 w-full rounded-full bg-emerald-950 px-6 text-base font-bold text-[#f8f0df] transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? loadingText : `Згенерувати аналіз · $${ANALYSIS_PRICE}`}
          </button>
        </form>
      </section>
      <SiteFooter />
    </main>
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
