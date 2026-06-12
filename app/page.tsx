export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="border-b border-line dark:border-slate-700">
        <div className="mx-auto grid min-h-[620px] max-w-7xl items-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-10 lg:py-14">
          <div className="max-w-2xl">
            <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-normal text-ink dark:text-slate-100 sm:text-5xl">
              Швидка первинна оцінка бізнес-ідеї перед запуском
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted dark:text-slate-400">
              Початківцям складно зрозуміти, чи варто витрачати час на ідею. Сервіс збирає ключові
              дані й за хвилину формує зрозумілий звіт для пітчу, обговорення з командою та демо перед журі.
            </p>
            <div className="mt-8">
              <a
                href="/analyze"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-brand px-6 text-sm font-bold text-white shadow-soft transition hover:bg-[#0b3d68]"
              >
                Проаналізувати ідею
              </a>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                ["Фокус", "Тільки головні гіпотези та ризики"],
                ["Швидкість", "Демо працює навіть без API-ключа"],
                ["Результат", "Звіт можна скопіювати або завантажити"]
              ].map(([title, text]) => (
                <div key={title} className="rounded-lg border border-line bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                  <p className="text-sm font-bold text-ink dark:text-slate-100">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted dark:text-slate-400">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-line bg-slate-50 p-3 shadow-soft dark:border-slate-700 dark:bg-slate-800/50">
            <div className="rounded-lg border border-line bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center justify-between gap-4 border-b border-line pb-4 dark:border-slate-700">
                <div>
                  <p className="text-sm font-bold text-ink dark:text-slate-100">Звіт перевірки стартапу</p>
                  <p className="mt-1 text-xs text-muted dark:text-slate-400">Ринок, аудиторія, ризики, MVP, оцінки</p>
                </div>
                <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-accent dark:bg-emerald-900/30 dark:text-emerald-400">
                  7.2 / 10
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  ["Потенціал ринку", "Є можливість для локального пілоту"],
                  ["Цільова аудиторія", "Студенти та відвідувачі кампусу"],
                  ["Ризики", "Готовність платити та операції"],
                  ["MVP", "Ручний пілот із формою заявки"]
                ].map(([title, text]) => (
                  <div key={title} className="rounded-lg border border-line bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                    <p className="text-sm font-bold text-ink dark:text-slate-100">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted dark:text-slate-400">{text}</p>
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
    </main>
  );
}
