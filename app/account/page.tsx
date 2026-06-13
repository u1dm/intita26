"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { logUserAction } from "@/lib/clientLogger";
import {
  ANALYSIS_PRICE,
  clearCurrentAccount,
  createAccount,
  getAccounts,
  getCurrentAccount,
  openHistoryItem,
  setCurrentAccount,
  topUpCurrentAccount
} from "@/lib/account";
import type { DemoAccount } from "@/lib/types";

const topUpAmounts = [5, 10, 25];
type AuthMode = "login" | "register";

export default function AccountPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<DemoAccount[]>([]);
  const [account, setAccount] = useState<DemoAccount | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [error, setError] = useState("");
  const [paymentAmount, setPaymentAmount] = useState<number | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "done">("idle");

  const totalSpent = useMemo(
    () => account?.history.reduce((sum, item) => sum + item.cost, 0) ?? 0,
    [account]
  );

  useEffect(() => {
    syncAccounts();
  }, []);

  function syncAccounts() {
    setAccounts(getAccounts());
    setAccount(getCurrentAccount());
  }

  function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanEmail = email.trim();

    if (!cleanEmail.includes("@") || cleanEmail.length < 5) {
      setError("Вкажіть коректний email.");
      return;
    }

    if (authMode === "login") {
      const existingAccount = accounts.find((item) => item.email.toLowerCase() === cleanEmail.toLowerCase());

      if (!existingAccount) {
        setError("Аккаунт з таким email не знайдено. Перейдіть на реєстрацію.");
        return;
      }

      setCurrentAccount(existingAccount.id);
      setEmail("");
      setName("");
      setError("");
      syncAccounts();
      return;
    }

    const cleanName = name.trim();

    if (cleanName.length < 2) {
      setError("Вкажіть ім'я або назву команди.");
      return;
    }

    const existingAccount = accounts.find((item) => item.email.toLowerCase() === cleanEmail.toLowerCase());
    if (existingAccount) {
      setError("Такий email вже зареєстровано. Перейдіть на вхід.");
      return;
    }

    const createdAccount = createAccount({ name: cleanName, email: cleanEmail });
    logUserAction({
      event: "account_created",
      account: {
        id: createdAccount.id,
        name: createdAccount.name,
        email: createdAccount.email
      },
      details: {
        source: "account_page"
      }
    });
    setName("");
    setEmail("");
    setError("");
    syncAccounts();
  }

  function handleSelect(accountId: string) {
    setCurrentAccount(accountId);
    syncAccounts();
  }

  function openPayment(amount: number) {
    setPaymentAmount(amount);
    setPaymentStatus("idle");
  }

  function closePayment() {
    if (paymentStatus === "processing") {
      return;
    }

    setPaymentAmount(null);
    setPaymentStatus("idle");
  }

  function confirmPayment() {
    if (!paymentAmount) {
      return;
    }

    setPaymentStatus("processing");
    window.setTimeout(() => {
      const updatedAccount = topUpCurrentAccount(paymentAmount);
      if (updatedAccount) {
        logUserAction({
          event: "balance_topped_up",
          account: {
            id: updatedAccount.id,
            name: updatedAccount.name,
            email: updatedAccount.email
          },
          details: {
            amount: paymentAmount,
            balanceAfter: updatedAccount.balance,
            paymentMode: "demo"
          }
        });
      }
      syncAccounts();
      setPaymentStatus("done");
      window.setTimeout(() => {
        setPaymentAmount(null);
        setPaymentStatus("idle");
      }, 900);
    }, 900);
  }

  function handleLogout() {
    clearCurrentAccount();
    syncAccounts();
  }

  function handleOpenReport(itemId: string) {
    const item = account?.history.find((historyItem) => historyItem.id === itemId);
    if (!item) {
      return;
    }

    openHistoryItem(item);
    router.push("/report");
  }

  return (
    <main className="page-shell">
      <SiteHeader active="account" />
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:gap-8 sm:px-8 sm:py-12 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
        <aside className="dark-surface motion-reveal rounded-[28px] p-5 sm:p-7 lg:sticky lg:top-24 lg:self-start">
          <div className="relative z-10">
            <p className="section-label text-[#d9e5d5]">Кабінет</p>
            <h1 className="font-display mt-4 text-4xl leading-tight text-[#f7efdf] sm:text-5xl">Баланс і історія перевірок</h1>
            <p className="mt-5 text-sm leading-7 text-[#d9e5d5]">
              У MVP аккаунти працюють локально в браузері. Поповнення демо-балансу не проводить реальну оплату, але
              показує майбутню модель сервісу: один аналіз коштує ${ANALYSIS_PRICE}.
            </p>
            <div className="mt-8 grid gap-3 border-t border-white/14 pt-5 text-sm text-[#f1e7d4]">
              <div className="flex justify-between gap-4">
                <span>Поточний баланс</span>
                <strong>${account?.balance.toFixed(2) ?? "0.00"}</strong>
              </div>
              <div className="flex justify-between gap-4">
                <span>Аналізів у історії</span>
                <strong>{account?.history.length ?? 0}</strong>
              </div>
              <div className="flex justify-between gap-4">
                <span>Витрачено</span>
                <strong>${totalSpent.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </aside>

        <div className="grid gap-6">
          <section className="paper-panel motion-reveal-slow rounded-[28px] p-4 sm:p-7">
            <div className="flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <h2 className="font-display break-words text-3xl leading-tight text-emerald-950 sm:text-4xl">
                  {account ? account.name : authMode === "login" ? "Увійдіть в аккаунт" : "Створіть аккаунт"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {account
                    ? account.email
                    : authMode === "login"
                      ? "Вкажіть email існуючого локального аккаунта, щоб відкрити баланс та історію."
                      : "Зареєструйте локальний аккаунт, щоб списувати $1 за аналіз і зберігати історію звітів."}
                </p>
              </div>
              {account ? (
                <button type="button" onClick={handleLogout} className="btn-secondary h-10 w-full px-4 sm:w-auto">
                  Вийти
                </button>
              ) : null}
            </div>

            {!account ? (
              <form onSubmit={handleAuth} className="mt-6 grid gap-5">
                <div className="grid grid-cols-2 rounded-full border border-line bg-[#fbf6eb] p-1">
                  {[
                    ["login", "Вхід"],
                    ["register", "Реєстрація"]
                  ].map(([mode, label]) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => {
                        setAuthMode(mode as AuthMode);
                        setError("");
                      }}
                      className={`h-10 rounded-full text-sm font-bold transition ${
                        authMode === mode ? "bg-emerald-950 text-[#fffdf6] shadow-sm" : "text-emerald-950 hover:bg-white"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {authMode === "register" ? (
                  <label className="block">
                    <span className="text-sm font-bold text-emerald-950">Ім&apos;я або команда</span>
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="focus-ring mt-2 h-12 w-full rounded-[14px] border border-line bg-[#fffdf6] px-4 text-base text-ink placeholder:text-muted/60 hover:bg-white"
                      placeholder="Наприклад: Intita Team"
                    />
                  </label>
                ) : null}

                <label className="block">
                  <span className="text-sm font-bold text-emerald-950">Email</span>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="focus-ring mt-2 h-12 w-full rounded-[14px] border border-line bg-[#fffdf6] px-4 text-base text-ink placeholder:text-muted/60 hover:bg-white"
                    placeholder="team@example.com"
                  />
                </label>
                {error ? (
                  <div className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                  </div>
                ) : null}
                <button type="submit" className="btn-primary w-full">
                  {authMode === "login" ? "Увійти" : "Зареєструвати аккаунт"}
                </button>
              </form>
            ) : (
              <div className="mt-6 grid gap-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  {topUpAmounts.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => openPayment(amount)}
                      className="motion-lift group rounded-[18px] border border-line bg-[#fffdf6] p-5 text-left transition hover:bg-white"
                    >
                      <span className="block text-sm font-bold text-muted">Поповнити демо-баланс</span>
                      <span className="mt-2 block font-display text-4xl leading-none text-emerald-950">${amount}</span>
                      <span className="mt-4 inline-flex text-sm font-bold text-emerald-950 transition group-hover:translate-x-1">
                        Відкрити оплату
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-xs leading-5 text-muted">
                  Це демо-поповнення для презентації. Реальна платіжна інтеграція не підключена.
                </p>
              </div>
            )}
          </section>

          {accounts.length > 1 ? (
            <section className="paper-panel rounded-[24px] p-5">
              <h2 className="text-sm font-black uppercase tracking-normal text-emerald-950">Аккаунти в цьому браузері</h2>
              <div className="mt-4 grid gap-2">
                {accounts.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={`rounded-[16px] border px-4 py-3 text-left transition duration-300 ${
                      account?.id === item.id
                        ? "border-emerald-950 bg-[#eef4e9]"
                        : "border-line bg-[#fffdf6] hover:border-emerald-950/35"
                    }`}
                  >
                    <span className="block font-bold text-emerald-950">{item.name}</span>
                    <span className="mt-1 block text-sm text-muted">{item.email} · ${item.balance.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <section className="paper-panel rounded-[28px] p-4 sm:p-7">
            <div className="flex flex-col gap-3 border-b border-line pb-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-display text-3xl leading-tight text-emerald-950 sm:text-4xl">Історія аналізів</h2>
                <p className="mt-2 text-sm text-muted">Звіти зберігаються локально для поточного аккаунта.</p>
              </div>
              <button type="button" onClick={() => router.push("/analyze")} className="btn-primary h-10 w-full px-4 sm:w-auto">
                Новий аналіз
              </button>
            </div>

            {account && account.history.length > 0 ? (
              <div className="mt-5 grid gap-3">
                {account.history.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleOpenReport(item.id)}
                    className="motion-lift grid gap-3 rounded-[18px] border border-line bg-[#fffdf6] p-5 text-left transition hover:bg-white md:grid-cols-[1fr_auto]"
                  >
                    <span>
                      <span className="block text-lg font-bold text-emerald-950">{item.form.ideaName}</span>
                      <span className="mt-2 block text-sm leading-6 text-muted">
                        {formatDate(item.createdAt)} · {item.form.location || "локація не вказана"}
                      </span>
                    </span>
                    <span className="text-sm font-bold text-emerald-950">Відкрити звіт</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-[20px] border border-dashed border-line bg-[#fffdf6]/80 p-7 text-center">
                <p className="text-lg font-bold text-emerald-950">Історія поки порожня</p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                  Створіть аккаунт і запустіть перший аналіз. Після списання $1 звіт з&apos;явиться тут.
                </p>
              </div>
            )}
          </section>
        </div>
      </section>
      {paymentAmount ? (
        <PaymentModal
          amount={paymentAmount}
          status={paymentStatus}
          onClose={closePayment}
          onConfirm={confirmPayment}
        />
      ) : null}
      <SiteFooter />
    </main>
  );
}

function PaymentModal({
  amount,
  status,
  onClose,
  onConfirm
}: {
  amount: number;
  status: "idle" | "processing" | "done";
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="page-overlay isolate grid place-items-center bg-emerald-950/34 px-4 backdrop-blur-md">
      <div className="motion-pop w-full max-w-md overflow-hidden rounded-[30px] border border-white/70 bg-[#fffdf6] shadow-[0_35px_100px_rgba(11,51,41,0.28)]">
        <div className="dark-surface p-5 sm:p-6">
          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#d9e5d5]">IdeaCheck Pay</p>
                <h2 className="font-display mt-3 text-4xl leading-none text-[#f8f0df]">${amount}</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={status === "processing"}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/18 text-xl leading-none text-[#f8f0df] transition hover:bg-white/10 disabled:opacity-40"
                aria-label="Закрити"
              >
                ×
              </button>
            </div>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/12">
              <div className={`h-full rounded-full bg-[#d9fff2] ${status === "processing" ? "payment-progress" : status === "done" ? "w-full" : "w-2/3"}`} />
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="rounded-[22px] border border-line bg-[#fbf6eb] p-4">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-muted">Метод</span>
              <strong className="text-emerald-950">Demo card ·••• 2026</strong>
            </div>
            <div className="mt-3 flex items-center justify-between gap-4 text-sm">
              <span className="text-muted">Операція</span>
              <strong className="text-emerald-950">Поповнення балансу</strong>
            </div>
            <div className="mt-3 flex items-center justify-between gap-4 text-sm">
              <span className="text-muted">Статус</span>
              <strong className="text-emerald-950">
                {status === "done" ? "Підтверджено" : status === "processing" ? "Обробка..." : "Готово до оплати"}
              </strong>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-muted">
            Це демонстраційне вікно оплати для хакатону. Дані вводити не потрібно, реальні гроші не списуються.
          </p>

          <button
            type="button"
            onClick={onConfirm}
            disabled={status !== "idle"}
            className="shine mt-5 h-12 w-full rounded-full bg-emerald-950 px-5 text-sm font-bold text-[#fffdf6] transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-emerald-950/60"
          >
            {status === "done" ? "Баланс поповнено" : status === "processing" ? "Проводимо оплату..." : "Підтвердити демо-оплату"}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}
