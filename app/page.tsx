import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const reportItems = [
  ["Ринок", "попит, контекст, обмеження"],
  ["Аудиторія", "сегменти та реальні потреби"],
  ["Ризики", "рівень, причина, пом'якшення"],
  ["MVP", "що можна перевірити першим"],
  ["Оцінки", "шість числових критеріїв"]
];

const memoItems = [
  ["Ринок та аудиторія", "розмір ринку, тренди та цільовий клієнт"],
  ["Конкуренти та альтернативи", "сильні гравці та ваша перевага"],
  ["Ризики та припущення", "що може піти не так і як перевірити"],
  ["MVP та бізнес-модель", "юнiт-економіка та модель зростання"],
  ["Оцінки та рекомендації", "підсумкова оцінка та наступні кроки"]
];

const routes = [
  ["/", "Головна", "зрозуміле позиціювання сервісу"],
  ["/account", "Кабінет", "баланс, поповнення та історія"],
  ["/analyze", "Аналіз", "форма з прикладом і списанням $1"],
  ["/compare", "Порівняння", "обрати найсильнішу ідею з історії"],
  ["/report", "Звіт", "інфографіка, картки, експорт"],
  ["/methodology", "Методика", "як читати оцінки й ризики"]
];

export default function Home() {
  return (
    <main className="page-shell">
      <SiteHeader active="home" />

      <section className="relative overflow-hidden">
        <div className="relative z-10 mx-auto grid min-h-[650px] max-w-7xl items-center gap-10 px-4 py-12 sm:min-h-[720px] sm:px-8 sm:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
          <div className="motion-reveal min-w-0">
            <h1 className="font-display max-w-3xl break-words text-[3.35rem] leading-[0.96] text-emerald-950 sm:text-7xl lg:text-8xl">
              Перевірте бізнес-ідею до першого запуску
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#26463d] sm:mt-7 sm:text-lg sm:leading-8">
              IdeaCheck перетворює короткий опис стартапу на практичний звіт: ринок, аудиторія, конкуренти, ризики,
              бізнес-модель, MVP і підсумкові оцінки.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/analyze" className="shine btn-primary">
                Перевірити ідею
              </Link>
              <Link href="/methodology" className="btn-secondary">
                Як працює методика
              </Link>
            </div>
            <div className="mt-8 grid gap-3 text-sm text-[#26463d] sm:mt-10 sm:grid-cols-3 sm:gap-4">
              {["$1 за аналіз", "історія в кабінеті", "звіт за хвилини"].map((item) => (
                <div key={item} className="border-t border-emerald-950/18 pt-3">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="motion-reveal-slow min-w-0">
            <div className="premium-card dark-surface motion-float rounded-[26px] p-5 sm:rounded-[30px] sm:p-8">
              <div className="relative z-10">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#d9e5d5]">Аналітична записка</p>
                    <h2 className="font-display mt-6 max-w-md text-4xl leading-tight text-[#f8f0df] sm:mt-8 sm:text-5xl">
                      Пілот варто запускати
                    </h2>
                  </div>
                  <p className="text-xs font-bold text-[#d9e5d5]">IC-2026-0614</p>
                </div>

                <div className="mt-8 border-t border-[#f8f0df]/26 pt-7 sm:mt-10 sm:pt-8">
                  <div className="grid gap-7 md:grid-cols-[0.72fr_1.28fr] md:gap-8">
                    <div>
                      <p className="text-sm text-[#d9e5d5]">Загальна оцінка</p>
                      <p className="font-display mt-4 text-6xl leading-none text-[#f8f0df] sm:text-7xl">7.8</p>
                      <p className="mt-2 text-sm text-[#d9e5d5]">Хороший потенціал</p>
                    </div>
                    <div className="grid gap-3 border-t border-[#f8f0df]/22 pt-5 text-sm md:border-l md:border-t-0 md:pl-7 md:pt-0">
                      {[
                        ["Потенціал ринку", "8.0"],
                        ["Аудиторія", "9.0"],
                        ["Конкуренція", "7.5"],
                        ["MVP та модель", "7.0"],
                        ["Рівень ризику", "середній"]
                      ].map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between gap-4 text-[#f4ead8]">
                          <span>{label}</span>
                          <span className="font-bold">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 border-t border-[#f8f0df]/18 pt-6 md:grid-cols-[1fr_auto]">
                  <div>
                    <p className="text-sm font-bold text-[#f8f0df]">Короткий висновок</p>
                    <p className="mt-2 max-w-md text-sm leading-6 text-[#d9e5d5]">
                      Ідея має достатній попит і чітку аудиторію. Наступний крок - малий платний пілот.
                    </p>
                  </div>
                  <div className="grid place-items-center rounded-full border border-[#f8f0df]/18 px-5 py-3 text-sm font-bold text-[#f8f0df]">
                    команда IdeaCheck
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="motion-reveal">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
          <div className="paper-panel rounded-[26px] p-3 sm:rounded-[28px] sm:p-4">
            <div className="rounded-[20px] border border-line bg-[#fffdf6] p-5 sm:p-6">
              <div className="grid gap-6 border-b border-line pb-6 md:grid-cols-[1fr_auto] md:items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-950">Аналітична записка</p>
                  <h2 className="font-display mt-4 text-3xl leading-tight text-emerald-950 sm:text-4xl">Пілот варто запускати</h2>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-muted">
                    Один документ збирає висновок, ризики, бізнес-модель і наступні кроки без зайвої презентаційності.
                  </p>
                </div>
                <div className="rounded-full bg-[#dce7db] px-4 py-2 text-sm font-bold text-emerald-950">8.2 / 10</div>
              </div>
              <div className="mt-6 grid gap-4">
                <div className="rounded-[18px] border border-line bg-[#fbf6eb] p-5">
                  <p className="text-sm font-bold text-emerald-950">Короткий висновок</p>
                  <p className="mt-3 text-sm leading-7 text-muted">
                    Ідея має достатній локальний попит і зрозумілий перший сегмент. Почніть з малого платного пілоту,
                    щоб перевірити готовність платити до розробки повної платформи.
                  </p>
                </div>
                {memoItems.map(([title, text]) => (
                  <div key={title} className="grid gap-3 border-b border-line pb-3 text-sm last:border-0 sm:grid-cols-[220px_1fr]">
                    <p className="font-bold text-emerald-950">{title}</p>
                    <p className="text-muted">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="min-w-0 self-center">
            <p className="section-label">Результат</p>
            <h2 className="font-display mt-4 text-4xl leading-tight text-emerald-950 sm:text-5xl">Звіт виглядає як документ для рішення</h2>
            <div className="mt-8 grid gap-3">
              {reportItems.map(([title, text]) => (
                <div key={title} className="grid gap-1 border-b border-line pb-3 text-sm sm:grid-cols-[120px_1fr] sm:gap-4">
                  <p className="font-bold text-emerald-950">{title}</p>
                  <p className="text-muted">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="motion-reveal mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-8 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
        <div className="min-w-0">
          <p className="section-label">Структура</p>
          <h2 className="font-display mt-4 break-words text-4xl leading-tight text-emerald-950 sm:text-5xl">
            Багатосторінковий MVP, який легко показати
          </h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-muted">
            У демо є зрозумілий маршрут: головна пояснює цінність, форма збирає дані, звіт показує результат, методика
            допомагає читати оцінки.
          </p>
        </div>
        <div className="grid min-w-0 gap-3">
          {routes.map(([href, title, text]) => (
            <Link
              key={href}
              href={href}
              className="motion-lift group grid gap-3 rounded-[18px] border border-line bg-[#fffdf6] p-5 transition hover:border-emerald-950/40 hover:bg-white sm:grid-cols-[130px_1fr_auto]"
            >
              <span className="min-w-0 text-lg font-semibold text-emerald-950">{title}</span>
              <span className="min-w-0 text-sm leading-6 text-muted">{text}</span>
              <span className="text-sm font-bold text-emerald-950 transition group-hover:translate-x-1">Відкрити</span>
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
