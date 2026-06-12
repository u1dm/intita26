import { NextResponse } from "next/server";
import { createMockReport, normalizeReport, systemPrompt } from "@/lib/report";
import type { IdeaFormData } from "@/lib/types";

export const runtime = "nodejs";

const requiredFields: (keyof IdeaFormData)[] = [
  "ideaName",
  "description",
  "location",
  "targetAudience",
  "problem",
  "monetization",
  "competitors",
  "resources"
];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<IdeaFormData>;
    const input = normalizeInput(body);
    const missing = requiredFields.filter((field) => input[field].trim().length < 3);

    if (missing.length > 0 || input.description.trim().length < 25 || input.problem.trim().length < 15) {
      return NextResponse.json(
        {
          error: "Please provide more detail for the business idea, description, and problem."
        },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(createMockReport(input));
    }

    const report = await analyzeWithOpenAI(input);
    return NextResponse.json(report);
  } catch (error) {
    console.error("Analyze API error:", error);
    return NextResponse.json(
      {
        error: "Analysis failed. Please try again."
      },
      { status: 500 }
    );
  }
}

function normalizeInput(body: Partial<IdeaFormData>): IdeaFormData {
  return {
    ideaName: body.ideaName?.toString() ?? "",
    description: body.description?.toString() ?? "",
    location: body.location?.toString() ?? "",
    targetAudience: body.targetAudience?.toString() ?? "",
    problem: body.problem?.toString() ?? "",
    monetization: body.monetization?.toString() ?? "",
    competitors: body.competitors?.toString() ?? "",
    resources: body.resources?.toString() ?? ""
  };
}

async function analyzeWithOpenAI(input: IdeaFormData) {
  const fallback = createMockReport(input);
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const baseUrl = process.env.OPENAI_BASE_URL || defaultChatCompletionsUrl(model);

  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model,
        response_format: { type: "json_object" },
        temperature: 0.35,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Return a JSON report that exactly matches this TypeScript shape:
{
  "summary": "string",
  "marketPotential": "string",
  "targetAudience": [{"segment": "string", "needs": "string"}],
  "competitors": [{"name": "string", "type": "direct | indirect", "description": "string"}],
  "risks": [{"title": "string", "level": "low | medium | high", "description": "string", "mitigation": "string"}],
  "businessModel": "string",
  "revenueStreams": ["string"],
  "mvp": "string",
  "recommendations": ["string"],
  "successMetrics": ["string"],
  "scores": {
    "marketPotential": 1,
    "audienceClarity": 1,
    "competitiveness": 1,
    "mvpSimplicity": 1,
    "riskLevel": 1,
    "overall": 1
  },
  "finalConclusion": "string"
}

Scores must be numbers from 1 to 10.

Business idea input:
${JSON.stringify(input, null, 2)}`
          }
        ]
      })
    });

    if (!response.ok) {
      console.error("OpenAI response error:", await response.text());
      return fallback;
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (typeof content !== "string") {
      return fallback;
    }

    return normalizeReport(JSON.parse(content));
  } catch (error) {
    console.error("OpenAI analysis fallback:", error);
    return fallback;
  }
}

function defaultChatCompletionsUrl(model: string) {
  if (model.toLowerCase().includes("deepseek")) {
    return "https://api.deepseek.com/chat/completions";
  }

  return "https://api.openai.com/v1/chat/completions";
}
