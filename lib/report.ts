import type { AnalysisReport, IdeaFormData } from "./types";

const competitorTypeValues = new Set(["direct", "indirect"]);
const riskLevelValues = new Set(["low", "medium", "high"]);

export const systemPrompt = `Ти бізнес-аналітик для первинної перевірки стартап-ідей на ранній стадії.
Проаналізуй бізнес-ідею користувача простою українською мовою.
Оціни потенціал ринку, цільову аудиторію, конкурентів, ризики, бізнес-модель, MVP, рекомендації, метрики успіху та підсумкові оцінки.
Не вигадуй точні числа без джерел.
Якщо даних бракує, чітко вкажи припущення.
Поверни лише валідний JSON.`;

export function createMockReport(input: IdeaFormData): AnalysisReport {
  const name = input.ideaName.trim() || "Стартап-ідея";
  const location = input.location.trim() || "обраний ринок";
  const audience = input.targetAudience.trim() || "перші користувачі";
  const competitorList = splitList(input.competitors);

  return normalizeReport({
    summary: `${name} розв'язує зрозумілу проблему для аудиторії: ${audience}. За наданим описом ідея підходить для невеликого MVP і швидкої перевірки в локації: ${location}. Основні припущення варто перевірити через інтерв'ю, попит на лендингу та простий платний пілот.`,
    marketPotential: `Ринковий потенціал виглядає помірним або добрим, якщо проблема справді часта й болюча для ${location}. Перша перевірка має фокусуватися на готовності платити, а не на широких оцінках розміру ринку без джерел.`,
    targetAudience: [
      {
        segment: audience,
        needs: `Простий і надійний спосіб розв'язати проблему: ${input.problem || "заявлена повсякденна проблема"}.`
      },
      {
        segment: "Перші користувачі та активна аудиторія",
        needs: "Швидкий доступ, прозора ціна та впевненість, що сервіс спрацює в потрібний момент."
      }
    ],
    competitors: competitorList.length
      ? competitorList.map((item, index) => ({
          name: item,
          type: index === 0 ? "direct" : "indirect",
          description:
            index === 0
              ? "Найближча альтернатива, яку вказав засновник. Порівняйте ціну, зручність і доступність."
              : "Замінник, який може зменшити терміновість проблеми або готовність платити."
        }))
      : [
          {
            name: "Ручні альтернативи",
            type: "indirect",
            description: "Користувачі можуть і далі розв'язувати проблему вручну, якщо новий сервіс не буде помітно простішим."
          }
        ],
    risks: [
      {
        title: "Слабка готовність платити",
        level: "high",
        description: "Користувачам може подобатися ідея, але вони можуть не платити, якщо проблема недостатньо термінова.",
        mitigation: "Перевірте платні передзамовлення, підписку або партнерський пілот до розробки повного продукту."
      },
      {
        title: "Операційна складність",
        level: "medium",
        description: "Команда може недооцінити підтримку, логістику, обслуговування або локальне виконання.",
        mitigation: "Запустіться в одному вузькому сегменті й документуйте кожен ручний крок під час MVP."
      },
      {
        title: "Конкурентні замінники",
        level: "medium",
        description: "Наявні звички та замінники можуть бути дешевшими або звичнішими для користувачів.",
        mitigation: "Позиціонуйте продукт навколо швидкості, зручності та одного сценарію, де альтернативи слабкі."
      }
    ],
    businessModel: input.monetization
      ? `Запропонована модель: ${input.monetization}. Спочатку її варто перевірити через один простий тариф.`
      : "Для MVP використайте одну просту платну пропозицію, а підписки чи партнерства додавайте після підтвердження попиту.",
    revenueStreams: splitList(input.monetization).length
      ? splitList(input.monetization)
      : ["Разова оплата", "Підписка", "Партнерський пілот"],
    mvp: `Створіть 24-годинний прототип, який демонструє головну цінність: збір заявок, показ доступності або деталей пропозиції та ручне обслуговування перших користувачів. Не автоматизуйте складні частини, доки попит не підтверджено.`,
    recommendations: [
      "Проведіть 10-15 інтерв'ю з цільовими користувачами й запитайте про останній реальний випадок цієї проблеми.",
      "Створіть лендинг або демонстраційний сценарій із чітким закликом до дії.",
      "Запустіть невеликий пілот в одній локації або одному сегменті аудиторії.",
      "Відстежуйте конверсію від інтересу до оплати або підтвердженої участі в пілоті.",
      "Залиште перший MVP ручним там, де автоматизація не критична для демонстрації."
    ],
    successMetrics: [
      "Кількість кваліфікованих користувачів, які залишили заявку",
      "Конверсія з відвідування лендингу в заповнення форми",
      "Частка користувачів, готових платити або долучитися до пілоту",
      "Час, потрібний для ручної доставки основної цінності",
      "Повторне використання або намір рекомендувати після першого досвіду"
    ],
    scores: {
      marketPotential: 7,
      audienceClarity: input.targetAudience.length > 20 ? 8 : 6,
      competitiveness: competitorList.length > 0 ? 6 : 7,
      mvpSimplicity: 8,
      riskLevel: 5,
      overall: 7
    },
    finalConclusion: `${name} є хорошим кандидатом для хакатонного MVP, якщо команда звузить обсяг і рано перевірить готовність платити. Наступний крок - невеликий пілот, а не повноцінна платформа.`
  });
}

export function normalizeReport(value: unknown): AnalysisReport {
  const source = isRecord(value) ? value : {};
  const scores = isRecord(source.scores) ? source.scores : {};

  return {
    summary: stringValue(source.summary, "Короткий опис не надано."),
    marketPotential: stringValue(source.marketPotential, "Ринковий потенціал потребує додаткової перевірки."),
    targetAudience: arrayValue(source.targetAudience).map((item) => {
      const record = isRecord(item) ? item : {};
      return {
        segment: stringValue(record.segment, "Цільовий сегмент"),
        needs: stringValue(record.needs, "Потреби варто перевірити через інтерв'ю.")
      };
    }),
    competitors: arrayValue(source.competitors).map((item) => {
      const record = isRecord(item) ? item : {};
      const rawType = stringValue(record.type, "indirect");
      return {
        name: stringValue(record.name, "Конкурент або замінник"),
        type: competitorTypeValues.has(rawType) ? (rawType as "direct" | "indirect") : "indirect",
        description: stringValue(record.description, "Порівняйте цю альтернативу під час перевірки.")
      };
    }),
    risks: arrayValue(source.risks).map((item) => {
      const record = isRecord(item) ? item : {};
      const rawLevel = stringValue(record.level, "medium");
      return {
        title: stringValue(record.title, "Ризик"),
        level: riskLevelValues.has(rawLevel) ? (rawLevel as "low" | "medium" | "high") : "medium",
        description: stringValue(record.description, "Цей ризик потребує перевірки."),
        mitigation: stringValue(record.mitigation, "Звузьте обсяг і перевірте припущення якомога раніше.")
      };
    }),
    businessModel: stringValue(source.businessModel, "Спочатку використайте просту платну пропозицію для MVP."),
    revenueStreams: arrayValue(source.revenueStreams).map((item) => String(item)).filter(Boolean),
    mvp: stringValue(source.mvp, "Запустіть найменшу ручну версію, яка підтверджує попит."),
    recommendations: arrayValue(source.recommendations).map((item) => String(item)).filter(Boolean),
    successMetrics: arrayValue(source.successMetrics).map((item) => String(item)).filter(Boolean),
    scores: {
      marketPotential: scoreValue(scores.marketPotential, 6),
      audienceClarity: scoreValue(scores.audienceClarity, 6),
      competitiveness: scoreValue(scores.competitiveness, 6),
      mvpSimplicity: scoreValue(scores.mvpSimplicity, 7),
      riskLevel: scoreValue(scores.riskLevel, 5),
      overall: scoreValue(scores.overall, 6)
    },
    finalConclusion: stringValue(source.finalConclusion, "Ідею варто перевірити через сфокусований MVP.")
  };
}

export function reportToText(report: AnalysisReport): string {
  return [
    `Короткий опис:\n${report.summary}`,
    `Потенціал ринку:\n${report.marketPotential}`,
    `Цільова аудиторія:\n${report.targetAudience.map((item) => `- ${item.segment}: ${item.needs}`).join("\n")}`,
    `Конкуренти:\n${report.competitors.map((item) => `- ${item.name} (${item.type}): ${item.description}`).join("\n")}`,
    `Ризики:\n${report.risks.map((item) => `- ${item.title} [${item.level}]: ${item.description} Як зменшити: ${item.mitigation}`).join("\n")}`,
    `Бізнес-модель:\n${report.businessModel}`,
    `Джерела доходу:\n${report.revenueStreams.map((item) => `- ${item}`).join("\n")}`,
    `MVP:\n${report.mvp}`,
    `Рекомендації:\n${report.recommendations.map((item) => `- ${item}`).join("\n")}`,
    `Метрики успіху:\n${report.successMetrics.map((item) => `- ${item}`).join("\n")}`,
    `Підсумкові оцінки:\nПотенціал ринку: ${report.scores.marketPotential}/10\nЧіткість аудиторії: ${report.scores.audienceClarity}/10\nКонкурентність: ${report.scores.competitiveness}/10\nПростота MVP: ${report.scores.mvpSimplicity}/10\nРівень ризику: ${report.scores.riskLevel}/10\nЗагальна оцінка: ${report.scores.overall}/10`,
    `Підсумковий висновок:\n${report.finalConclusion}`
  ].join("\n\n");
}

function splitList(value: string): string[] {
  return value
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function scoreValue(value: unknown, fallback: number): number {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) {
    return fallback;
  }
  return Math.min(10, Math.max(1, Math.round(number)));
}

function stringValue(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function arrayValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
