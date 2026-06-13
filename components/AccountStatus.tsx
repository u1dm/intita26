"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentAccount } from "@/lib/account";
import type { DemoAccount } from "@/lib/types";

export function AccountStatus() {
  const [account, setAccount] = useState<DemoAccount | null>(null);

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

  if (!account) {
    return (
      <Link
        href="/account"
        className="hidden h-10 items-center justify-center rounded-full border border-line bg-[#efe5d2]/74 px-4 text-sm font-bold text-emerald-950 transition duration-500 hover:-translate-y-0.5 hover:border-emerald-950/35 hover:bg-[#f5eddd] sm:inline-flex"
      >
        Увійти
      </Link>
    );
  }

  return (
    <Link
      href="/account"
      className="hidden h-10 items-center gap-3 rounded-full border border-line bg-[#efe5d2]/74 px-4 text-sm text-emerald-950 transition duration-500 hover:-translate-y-0.5 hover:border-emerald-950/35 hover:bg-[#f5eddd] sm:inline-flex"
    >
      <span className="font-bold">{account.name}</span>
      <span className="h-4 w-px bg-emerald-950/20" />
      <span>${account.balance.toFixed(2)}</span>
    </Link>
  );
}
