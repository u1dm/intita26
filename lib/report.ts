import type { AnalysisReport, IdeaFormData } from "./types";

const competitorTypeValues = new Set(["direct", "indirect"]);
const riskLevelValues = new Set(["low", "medium", "high"]);

export const systemPrompt = `You are a business analyst for early-stage startup idea validation.
Analyze the user's business idea in simple language.
Evaluate market potential, target audience, competitors, risks, business model, MVP, recommendations, success metrics, and final scores.
Do not invent exact numbers without sources.
If data is missing, clearly state assumptions.
Return only valid JSON.`;

export function createMockReport(input: IdeaFormData): AnalysisReport {
  const name = input.ideaName.trim() || "Startup idea";
  const location = input.location.trim() || "the selected market";
  const audience = input.targetAudience.trim() || "early adopters";
  const competitorList = splitList(input.competitors);

  return normalizeReport({
    summary: `${name} solves a clear problem for ${audience}. Based on the provided description, the idea is suitable for a small MVP and fast validation in ${location}. Main assumptions should be checked through interviews, landing page demand, and a simple paid pilot.`,
    marketPotential: `The market potential looks moderate to good if the problem is frequent and painful in ${location}. The first validation should focus on real willingness to pay instead of broad market-size claims.`,
    targetAudience: [
      {
        segment: audience,
        needs: `A simple, reliable way to solve: ${input.problem || "the stated everyday problem"}.`
      },
      {
        segment: "Early adopters and active users",
        needs: "Fast access, transparent pricing, and confidence that the service works when needed."
      }
    ],
    competitors: competitorList.length
      ? competitorList.map((item, index) => ({
          name: item,
          type: index === 0 ? "direct" : "indirect",
          description:
            index === 0
              ? "Closest alternative mentioned by the founder. Compare pricing, convenience, and availability."
              : "Substitute solution that may reduce urgency or willingness to pay."
        }))
      : [
          {
            name: "Manual alternatives",
            type: "indirect",
            description: "Users may continue solving the problem manually if the new service is not clearly easier."
          }
        ],
    risks: [
      {
        title: "Weak willingness to pay",
        level: "high",
        description: "Users may like the idea but avoid paying if the problem is not urgent enough.",
        mitigation: "Test paid pre-orders, subscriptions, or partner pilots before building a full product."
      },
      {
        title: "Operational complexity",
        level: "medium",
        description: "The team may underestimate support, logistics, maintenance, or local execution work.",
        mitigation: "Launch in one narrow segment and document every manual step during the MVP."
      },
      {
        title: "Competitive substitutes",
        level: "medium",
        description: "Existing habits and substitute products can be cheaper or more familiar.",
        mitigation: "Position around speed, convenience, and one specific user scenario where alternatives are weak."
      }
    ],
    businessModel: input.monetization
      ? `The proposed model is: ${input.monetization}. It should be tested with one simple pricing option first.`
      : "Use one simple paid offer for the MVP, then add subscriptions or partnerships after demand is proven.",
    revenueStreams: splitList(input.monetization).length
      ? splitList(input.monetization)
      : ["One-time payment", "Subscription", "Partner pilot"],
    mvp: `Build a 24-hour prototype that demonstrates the core promise: collect requests, show availability or offer details, and manually fulfill the first users. Avoid complex automation until demand is visible.`,
    recommendations: [
      "Interview 10-15 target users and ask about their last real experience with the problem.",
      "Create a landing page or demo flow with a clear call to action.",
      "Run a small pilot in one location or audience segment.",
      "Track conversion from interest to actual payment or committed trial.",
      "Keep the first MVP manual where automation is not essential for the demo."
    ],
    successMetrics: [
      "Number of qualified users who request the service",
      "Conversion from landing page visit to form submission",
      "Share of users ready to pay or join a pilot",
      "Time needed to deliver the core value manually",
      "Repeat use or referral intent after first experience"
    ],
    scores: {
      marketPotential: 7,
      audienceClarity: input.targetAudience.length > 20 ? 8 : 6,
      competitiveness: competitorList.length > 0 ? 6 : 7,
      mvpSimplicity: 8,
      riskLevel: 5,
      overall: 7
    },
    finalConclusion: `${name} is a solid hackathon MVP candidate if the team keeps the scope narrow and validates payment interest early. The next step is a small pilot, not a full platform.`
  });
}

export function normalizeReport(value: unknown): AnalysisReport {
  const source = isRecord(value) ? value : {};
  const scores = isRecord(source.scores) ? source.scores : {};

  return {
    summary: stringValue(source.summary, "No summary was provided."),
    marketPotential: stringValue(source.marketPotential, "Market potential requires more validation."),
    targetAudience: arrayValue(source.targetAudience).map((item) => {
      const record = isRecord(item) ? item : {};
      return {
        segment: stringValue(record.segment, "Target segment"),
        needs: stringValue(record.needs, "Needs should be validated through interviews.")
      };
    }),
    competitors: arrayValue(source.competitors).map((item) => {
      const record = isRecord(item) ? item : {};
      const rawType = stringValue(record.type, "indirect");
      return {
        name: stringValue(record.name, "Competitor or substitute"),
        type: competitorTypeValues.has(rawType) ? (rawType as "direct" | "indirect") : "indirect",
        description: stringValue(record.description, "Compare this alternative during validation.")
      };
    }),
    risks: arrayValue(source.risks).map((item) => {
      const record = isRecord(item) ? item : {};
      const rawLevel = stringValue(record.level, "medium");
      return {
        title: stringValue(record.title, "Risk"),
        level: riskLevelValues.has(rawLevel) ? (rawLevel as "low" | "medium" | "high") : "medium",
        description: stringValue(record.description, "This risk needs validation."),
        mitigation: stringValue(record.mitigation, "Reduce scope and test the assumption early.")
      };
    }),
    businessModel: stringValue(source.businessModel, "Use a simple paid MVP offer first."),
    revenueStreams: arrayValue(source.revenueStreams).map((item) => String(item)).filter(Boolean),
    mvp: stringValue(source.mvp, "Launch the smallest manual version that proves demand."),
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
    finalConclusion: stringValue(source.finalConclusion, "The idea is worth testing with a focused MVP.")
  };
}

export function reportToText(report: AnalysisReport): string {
  return [
    `Summary:\n${report.summary}`,
    `Market Potential:\n${report.marketPotential}`,
    `Target Audience:\n${report.targetAudience.map((item) => `- ${item.segment}: ${item.needs}`).join("\n")}`,
    `Competitors:\n${report.competitors.map((item) => `- ${item.name} (${item.type}): ${item.description}`).join("\n")}`,
    `Risks:\n${report.risks.map((item) => `- ${item.title} [${item.level}]: ${item.description} Mitigation: ${item.mitigation}`).join("\n")}`,
    `Business Model:\n${report.businessModel}`,
    `Revenue Streams:\n${report.revenueStreams.map((item) => `- ${item}`).join("\n")}`,
    `MVP:\n${report.mvp}`,
    `Recommendations:\n${report.recommendations.map((item) => `- ${item}`).join("\n")}`,
    `Success Metrics:\n${report.successMetrics.map((item) => `- ${item}`).join("\n")}`,
    `Final Scores:\nMarket potential: ${report.scores.marketPotential}/10\nAudience clarity: ${report.scores.audienceClarity}/10\nCompetitiveness: ${report.scores.competitiveness}/10\nMVP simplicity: ${report.scores.mvpSimplicity}/10\nRisk level: ${report.scores.riskLevel}/10\nOverall: ${report.scores.overall}/10`,
    `Final Conclusion:\n${report.finalConclusion}`
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
