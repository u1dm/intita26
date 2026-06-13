"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getCurrentAccount, openHistoryItem } from "@/lib/account";
import { scoreLabel } from "@/lib/labels";
import type { AnalysisHistoryItem, DemoAccount } from "@/lib/types";
import { useRouter } from "next/navigation";

const scoreKeys = ["marketPotential", "audienceClarity", "competitiveness", "mvpSimplicity", "riskLevel"] as const;

export default function ComparePage() {
  const router = useRouter();
  const [account, setAccount] = useState<DemoAccount | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const current = getCurrentAccount();
      setAccount(current);
      setSelectedIds(current?.history.slice(0, 3).map((item) => item.id) ?? []);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const selectedItems = useMemo(
    () => account?.history.filter((item) => selectedIds.includes(item.id)).slice(0, 3) ?? [],
    [account, selectedIds]
  );
  const bestIdea = selectedItems.reduce<AnalysisHistoryItem | null>(
    (best, item) => (!best || item.report.scores.overall > best.report.scores.overall ? item : best),
    null
  );

  function toggleItem(itemId: string) {
    setSelectedIds((current) => {
      if (current.includes(itemId)) {
        return current.filter((id) => id !== itemId);
      }

      return [itemId, ...current].slice(0, 3);
    });
  }

  function openReport(item: AnalysisHistoryItem) {
    openHistoryItem(item);
    router.push("/report");
  }

  return (
    <main className="page-shell">
      <SiteHeader active="compare" />
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-8 sm:py-12 lg:grid-cols-[0.72fr_1.28fr] lg:px-10">
        <aside className="dark-surface motion-reveal rounded-[28px] p-5 sm:p-7 lg:sticky lg:top-24 lg:self-start">
          <div className="relative z-10">
            <p className="section-label text-[#d9e5d5]">Порівняння</p>
            <h1 className="font-display mt-4 text-4xl leading-tight text-[#f7efdf] sm:text-5xl">
              Оберіть ідею, яку варто пітчити першою
            </h1>
            <p className="mt-5 text-sm leading-7 text-[#d9e5d5]">
              Сторінка бере звіти з історії аккаунта і порівнює до трьох ідей за ключовими критеріями. Це швидкий
              інструмент для рішення go / no-go перед демо.
            </p>

            <div className="mt-8 rounded-[22px] border border-white/14 bg-white/8 p-4">
              <p className="text-sm font-bold text-[#f8f0df]">Вердикт</p>
              {bestIdea ? (
                <>
                  <p className="font-display mt-3 text-3xl leading-none text-[#f8f0df]">
                    {bestIdea.report.scores.overall}/10
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[#d9e5d5]">{bestIdea.form.ideaName}</p>
                </>
              ) : (
                <p className="mt-3 text-sm leading-6 text-[#d9e5d5]">Потрібно мінімум два звіти в історії.</p>
              )}
            </div>
          </div>
        </aside>

        <div className="grid gap-6">
          <section className="paper-panel motion-reveal-slow rounded-[28px] p-4 sm:p-7">
            <div className="flex flex-col gap-4 border-b border-line pb-5 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="font-display text-3xl leading-tight text-emerald-950 sm:text-4xl">Ідеї з історії</h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Оберіть до трьох аналізів. Найсильніша ідея підсвічується автоматично.
                </p>
              </div>
              <Link href="/analyze" className="btn-primary h-10 w-full px-4 sm:w-auto">
                Новий аналіз
              </Link>
            </div>

            {!account ? (
              <EmptyCompareState
                title="Спочатку створіть аккаунт"
                text="Історія аналізів прив'язана до локального демо-аккаунта."
                href="/account"
                cta="Перейти до кабінету"
              />
            ) : account.history.length < 2 ? (
              <EmptyCompareState
                title="Потрібно щонайменше два звіти"
                text="Запустіть ще один аналіз, щоб порівняти ідеї між собою."
                href="/analyze"
                cta="Додати аналіз"
              />
            ) : (
              <div className="mt-5 grid gap-3">
                {account.history.map((item) => {
                  const selected = selectedIds.includes(item.id);
                  const isBest = bestIdea?.id === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      className={`motion-lift grid gap-4 rounded-[20px] border p-4 text-left transition sm:grid-cols-[1fr_auto] ${
                        selected ? "border-emerald-950 bg-[#eef4e9]" : "border-line bg-[#fffdf6] hover:border-emerald-950/35"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-lg font-bold text-emerald-950">{item.form.ideaName}</span>
                          {isBest ? (
                            <span className="rounded-full bg-emerald-950 px-3 py-1 text-xs font-bold text-[#fffdf6]">
                              найкраща
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-2 block text-sm leading-6 text-muted">
                          {formatDate(item.createdAt)} · {item.form.location || "локація не вказана"}
                        </span>
                      </span>
                      <span className="font-display text-4xl leading-none text-emerald-950">{item.report.scores.overall}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {selectedItems.length > 0 ? (
            <section className="grid gap-4 lg:grid-cols-3">
              {selectedItems.map((item) => (
                <article key={item.id} className="paper-panel motion-pop rounded-[24px] p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold leading-6 text-emerald-950">{item.form.ideaName}</h3>
                      <p className="mt-2 text-sm text-muted">{item.form.location || "локація не вказана"}</p>
                    </div>
                    <p className="font-display text-4xl leading-none text-emerald-950">{item.report.scores.overall}</p>
                  </div>

                  <div className="mt-5 grid gap-3">
                    {scoreKeys.map((key) => {
                      const score = item.report.scores[key];
                      return (
                        <div key={key}>
                          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                            <span className="font-bold text-ink">{scoreLabel(key)}</span>
                            <span className="font-black text-emerald-950">{score}/10</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-[#e2ddcf]">
                            <div className="animate-score h-full rounded-full bg-emerald-900" style={{ width: `${score * 10}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 rounded-[18px] bg-[#fffdf6] p-4">
                    <p className="text-xs font-black uppercase text-emerald-950">Короткий висновок</p>
                    <p className="mt-2 text-sm leading-6 text-muted">{item.report.finalConclusion}</p>
                  </div>

                  <button type="button" onClick={() => openReport(item)} className="btn-secondary mt-5 h-10 w-full px-4">
                    Відкрити звіт
                  </button>
                </article>
              ))}
            </section>
          ) : null}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

function EmptyCompareState({ title, text, href, cta }: { title: string; text: string; href: string; cta: string }) {
  return (
    <div className="mt-5 rounded-[22px] border border-dashed border-line bg-[#fffdf6]/82 p-7 text-center">
      <p className="text-lg font-bold text-emerald-950">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{text}</p>
      <Link href={href} className="btn-primary mt-5">
        {cta}
      </Link>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}
