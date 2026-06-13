export function riskLevelLabel(level: "low" | "medium" | "high") {
  const labels = {
    low: "низький",
    medium: "середній",
    high: "високий"
  };

  return labels[level];
}

export function competitorTypeLabel(type: "direct" | "indirect") {
  return type === "direct" ? "прямий" : "непрямий";
}

export function scoreLabel(label: string) {
  const labels: Record<string, string> = {
    marketPotential: "Потенціал ринку",
    audienceClarity: "Чіткість аудиторії",
    competitiveness: "Конкурентність",
    mvpSimplicity: "Простота MVP",
    riskLevel: "Рівень ризику",
    overall: "Загальна оцінка"
  };

  return labels[label] || label;
}
