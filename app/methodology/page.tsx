import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const sections = [
  ["Потенціал ринку", "Чи є проблема достатньо частою, дорогою або болючою для вибраної локації та сегмента."],
  ["Чіткість аудиторії", "Наскільки зрозуміло, хто саме користувач і яку ситуацію він хоче вирішити."],
  ["Конкурентність", "Чи є прямі або непрямі альтернативи та наскільки складно від них відрізнитися."],
  ["Простота MVP", "Чи можна показати основну цінність без великої команди, складної бази або довгої розробки."],
  ["Рівень ризику", "Наскільки сильні операційні, ринкові та продуктові ризики першого запуску."]
];

export default function MethodologyPage() {
  return (
    <main className="page-shell">
      <SiteHeader active="methodology" />
      <section className="mx-auto max-w-5xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="paper-panel motion-reveal rounded-[28px] p-6 sm:p-8">
          <p className="section-label">Методика</p>
          <h1 className="font-display mt-4 text-5xl leading-tight text-emerald-950">Методика первинної оцінки</h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-muted">
            IdeaCheck не замінює повне дослідження ринку. Його завдання - швидко зібрати перші припущення,
            показати слабкі місця й допомогти команді вирішити, який MVP варто робити першим.
          </p>

          <div className="mt-8 grid gap-4">
            {sections.map(([title, text]) => (
              <article key={title} className="grid gap-3 border-t border-line pt-5 transition-colors duration-500 hover:border-emerald-950/30 sm:grid-cols-[220px_1fr]">
                <h2 className="text-lg font-semibold text-emerald-950">{title}</h2>
                <p className="text-sm leading-7 text-muted">{text}</p>
              </article>
            ))}
          </div>

          <div className="dark-surface mt-8 rounded-[20px] p-6 text-[#f7f2e7]">
            <div className="relative z-10">
            <p className="text-sm font-bold text-[#f8f0df]">Як читати оцінки</p>
            <p className="mt-2 text-sm leading-7 text-[#dce7db]">
              Оцінка 1-10 не є прогнозом успіху. Це індикатор якості поточних припущень. Низька оцінка означає,
              що ідею краще звузити або перевірити дешевшим експериментом.
            </p>
            </div>
          </div>

          <Link
            href="/analyze"
            className="btn-primary mt-8"
          >
            Перевірити ідею
          </Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
