import type { AnalysisHistoryItem, AnalysisReport, DemoAccount, IdeaFormData } from "./types";

const ACCOUNTS_KEY = "ideacheck:accounts";
const CURRENT_ACCOUNT_KEY = "ideacheck:current-account";

export const ANALYSIS_PRICE = 1;
export const START_BALANCE = 3;

export type AccountDraft = {
  name: string;
  email: string;
};

export function getAccounts(): DemoAccount[] {
  if (typeof window === "undefined") {
    return [];
  }

  return readAccounts();
}

export function getCurrentAccount(): DemoAccount | null {
  if (typeof window === "undefined") {
    return null;
  }

  const currentId = window.localStorage.getItem(CURRENT_ACCOUNT_KEY);
  if (!currentId) {
    return null;
  }

  return readAccounts().find((account) => account.id === currentId) ?? null;
}

export function createAccount(draft: AccountDraft): DemoAccount {
  const accounts = readAccounts();
  const email = draft.email.trim().toLowerCase();
  const existing = accounts.find((account) => account.email.toLowerCase() === email);

  if (existing) {
    setCurrentAccount(existing.id);
    return existing;
  }

  const account: DemoAccount = {
    id: crypto.randomUUID(),
    name: draft.name.trim(),
    email,
    balance: START_BALANCE,
    createdAt: new Date().toISOString(),
    history: []
  };

  writeAccounts([account, ...accounts]);
  setCurrentAccount(account.id);
  return account;
}

export function setCurrentAccount(accountId: string) {
  window.localStorage.setItem(CURRENT_ACCOUNT_KEY, accountId);
  notifyAccountChange();
}

export function clearCurrentAccount() {
  window.localStorage.removeItem(CURRENT_ACCOUNT_KEY);
  notifyAccountChange();
}

export function topUpCurrentAccount(amount: number) {
  const account = getCurrentAccount();
  if (!account) {
    return null;
  }

  const updated = updateAccount(account.id, {
    balance: roundMoney(account.balance + amount)
  });
  notifyAccountChange();
  return updated;
}

export function canRunAnalysis(account: DemoAccount | null) {
  return Boolean(account && account.balance >= ANALYSIS_PRICE);
}

export function savePaidAnalysis(form: IdeaFormData, report: AnalysisReport): DemoAccount | null {
  const account = getCurrentAccount();
  if (!account || account.balance < ANALYSIS_PRICE) {
    return null;
  }

  const item: AnalysisHistoryItem = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    cost: ANALYSIS_PRICE,
    form,
    report
  };

  const updated = updateAccount(account.id, {
    balance: roundMoney(account.balance - ANALYSIS_PRICE),
    history: [item, ...account.history]
  });
  notifyAccountChange();
  return updated;
}

export function openHistoryItem(item: AnalysisHistoryItem) {
  window.sessionStorage.setItem("ideacheck:form", JSON.stringify(item.form));
  window.sessionStorage.setItem("ideacheck:report", JSON.stringify(item.report));
}

function readAccounts(): DemoAccount[] {
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as DemoAccount[]) : [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: DemoAccount[]) {
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function updateAccount(accountId: string, patch: Partial<DemoAccount>) {
  const accounts = readAccounts();
  const updated = accounts.map((account) => (account.id === accountId ? { ...account, ...patch } : account));
  writeAccounts(updated);
  return updated.find((account) => account.id === accountId) ?? null;
}

function notifyAccountChange() {
  window.dispatchEvent(new Event("ideacheck:account-change"));
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
