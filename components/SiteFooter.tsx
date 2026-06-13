import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-[#0b3329] text-[#f7f2e7]">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 text-sm sm:px-8 md:grid-cols-[1.3fr_0.7fr_0.7fr] lg:px-10">
        <div>
          <p className="font-display text-2xl leading-none text-[#f8f0df]">IdeaCheck</p>
          <p className="mt-3 max-w-sm leading-6 text-[#dce7db]">
            Первинна оцінка бізнес-ідей для команд, які хочуть перевірити напрям до розробки.
          </p>
        </div>
        <div>
          <p className="font-bold text-[#f8f0df]">Навігація</p>
          <div className="mt-3 grid gap-2 text-[#dce7db]">
            <Link href="/" className="hover:text-[#f8f0df]">Головна</Link>
            <Link href="/analyze" className="hover:text-[#f8f0df]">Аналіз</Link>
            <Link href="/compare" className="hover:text-[#f8f0df]">Порівняння</Link>
            <Link href="/methodology" className="hover:text-[#f8f0df]">Методика</Link>
          </div>
        </div>
        <div>
          <p className="font-bold text-[#f8f0df]">Документи</p>
          <div className="mt-3 grid gap-2 text-[#dce7db]">
            <span>Звіт у форматі .txt</span>
            <span>Історія в кабінеті</span>
            <span>Демо-баланс і $1 за аналіз</span>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-[#dce7db] sm:px-8 lg:px-10">
          <span>XRock team</span>
          <span>Hackathon MVP</span>
        </div>
      </div>
    </footer>
  );
}
