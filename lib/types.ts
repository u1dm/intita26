export type IdeaFormData = {
  ideaName: string;
  description: string;
  location: string;
  targetAudience: string;
  problem: string;
  monetization: string;
  competitors: string;
  resources: string;
};

export type AnalysisReport = {
  summary: string;
  marketPotential: string;
  targetAudience: {
    segment: string;
    needs: string;
  }[];
  competitors: {
    name: string;
    type: "direct" | "indirect";
    description: string;
  }[];
  risks: {
    title: string;
    level: "low" | "medium" | "high";
    description: string;
    mitigation: string;
  }[];
  businessModel: string;
  revenueStreams: string[];
  mvp: string;
  recommendations: string[];
  successMetrics: string[];
  scores: {
    marketPotential: number;
    audienceClarity: number;
    competitiveness: number;
    mvpSimplicity: number;
    riskLevel: number;
    overall: number;
  };
  finalConclusion: string;
};

export type AnalysisHistoryItem = {
  id: string;
  createdAt: string;
  cost: number;
  form: IdeaFormData;
  report: AnalysisReport;
};

export type DemoAccount = {
  id: string;
  name: string;
  email: string;
  balance: number;
  createdAt: string;
  history: AnalysisHistoryItem[];
};
