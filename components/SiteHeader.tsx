import Link from "next/link";
import { AccountStatus } from "./AccountStatus";

type SiteHeaderProps = {
  active?: "home" | "analyze" | "compare" | "methodology" | "account";
};

const navItems = [
  { href: "/", label: "Головна", key: "home" },
  { href: "/analyze", label: "Аналіз", key: "analyze" },
  { href: "/compare", label: "Порівняння", key: "compare" },
  { href: "/methodology", label: "Методика", key: "methodology" },
  { href: "/account", label: "Кабінет", key: "account" }
] as const;

export function SiteHeader({ active }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-[#fbf6eb]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-8 lg:px-10">
        <Link href="/" className="group flex min-w-0 items-center gap-2 sm:gap-3" aria-label="IdeaCheck">
          <span className="grid h-8 w-8 shrink-0 rotate-45 place-items-center rounded-sm border-2 border-emerald-950 bg-[#fffdf6] transition-transform duration-500 group-hover:rotate-[50deg] sm:h-9 sm:w-9">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-950" />
          </span>
          <span className="font-display truncate text-xl leading-none text-emerald-950 sm:text-2xl">IdeaCheck</span>
        </Link>

        <nav className="hidden items-center gap-6 text-[0.95rem] font-semibold text-muted md:flex lg:gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                active === item.key
                  ? "relative py-6 text-emerald-950 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-100 after:bg-emerald-950 after:transition-transform after:duration-500"
                  : "relative py-6 transition-colors duration-500 hover:text-emerald-950 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-emerald-950 after:transition-transform after:duration-500 hover:after:scale-x-100"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <AccountStatus />
          <Link
            href="/analyze"
            className="inline-flex h-10 items-center justify-center rounded-full bg-emerald-950 px-3 text-xs font-bold text-[#f7efdf] shadow-sm transition duration-500 hover:-translate-y-0.5 hover:bg-emerald-900 hover:shadow-lg sm:px-4 sm:text-sm"
          >
            <span className="sm:hidden">Аналіз</span>
            <span className="hidden sm:inline">Перевірити ідею</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
