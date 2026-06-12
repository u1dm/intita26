import type { Metadata } from "next";
import { ThemeProvider, ThemeToggle } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "IdeaCheck AI",
  description: "AI-сервіс первинної оцінки бізнес-ідей і стартапів"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/80 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-xs font-black text-white">
            AI
          </div>
          <span className="text-base font-bold text-ink dark:text-slate-100">IdeaCheck AI</span>
        </a>
        <nav className="flex items-center gap-4">
          <a
            href="/analyze"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted transition hover:bg-slate-100 hover:text-ink dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            Аналіз
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
