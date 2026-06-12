# AGENTS.md

## Project Goal

Build a hackathon MVP: an AI-powered web app for primary evaluation of business ideas and startups.

The app helps beginner entrepreneurs quickly check a startup idea before launch and receive a short analytical report.

The report should include:

* idea summary
* market potential
* target audience
* competitors
* risks
* business model
* MVP suggestion
* recommendations
* final scores from 1 to 10

The project must be demo-ready within 24 hours.

---

## Tech Stack

Use:

* Next.js
* TypeScript
* Tailwind CSS
* API route for analysis
* OpenAI API if `OPENAI_API_KEY` is available
* mock response if API key is missing

Do not add unnecessary services, databases, auth, payments, complex state managers, or admin panels.

---

## Main User Flow

1. User opens landing page.
2. User clicks “Analyze idea”.
3. User fills in the business idea form.
4. User clicks “Generate analysis”.
5. App shows loading state.
6. App displays structured report.
7. User can copy or download the report.
8. User can start a new analysis.

---

## Required Pages / Sections

### Landing Section

Must include:

* project name
* short explanation of the problem
* short explanation of the solution
* CTA button: “Analyze idea”

### Input Form

Required fields:

* idea name
* idea description
* city / country
* target audience
* problem being solved
* monetization model
* known competitors
* team resources / budget

Also add:

* “Fill with example” button
* form validation
* error message if input is too short

### Loading State

Show simple loading messages:

* “Analyzing idea...”
* “Checking risks...”
* “Evaluating business model...”
* “Preparing report...”

### Result Page / Result Section

Show report in clear cards:

* Summary
* Market Potential
* Target Audience
* Competitors
* Risks
* Business Model
* Revenue Streams
* MVP
* Recommendations
* Success Metrics
* Final Scores
* Final Conclusion

Add buttons:

* Copy report
* Download `.txt`
* New analysis

---

## API Route

Create an endpoint:

```txt
POST /api/analyze
```

Input: form data.

Output: JSON report.

If `OPENAI_API_KEY` exists:

* call OpenAI
* ask for strict JSON
* validate/fallback if response is broken

If no API key:

* return realistic mock data based on user input

---

## AI System Prompt

Use this system prompt inside the API route:

```txt
You are a business analyst for early-stage startup idea validation.
Analyze the user's business idea in simple language.
Evaluate market potential, target audience, competitors, risks, business model, MVP, recommendations, success metrics, and final scores.
Do not invent exact numbers without sources.
If data is missing, clearly state assumptions.
Return only valid JSON.
```

---

## JSON Schema

The API must return this shape:

```ts
type AnalysisReport = {
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
```

Scores must be numbers from 1 to 10.

---

## Demo Example

Add a button that fills the form with this example:

```txt
Idea: Powerbank rental service for students

Description:
A mobile app and a network of rental stations in universities where students can rent a powerbank for a few hours.

City / Country:
Vinnytsia, Ukraine

Target audience:
Students, teachers, campus visitors

Problem:
People often run out of phone battery during classes or while moving around campus.

Monetization:
Hourly payment, subscription, university partnerships

Competitors:
Personal powerbanks, charging stations, powerbank rental services in malls

Resources:
Small student team, limited budget, 24-hour hackathon prototype
```

---

## Design Requirements

Keep the design:

* clean
* modern
* light theme
* card-based
* mobile-friendly
* good-looking for hackathon presentation

Use Tailwind CSS only.

Avoid complicated animations. Simple hover states and loading states are enough.

---

## Development Priorities

Priority 1:
Working form, API route, mock report, result UI.

Priority 2:
OpenAI integration.

Priority 3:
Copy/download report.

Priority 4:
Visual polish.

Do not spend time on:

* authentication
* database
* user accounts
* payment
* real market data scraping
* complex dashboards
* multi-language support unless everything else is done

---

## Code Style

* Use TypeScript types.
* Keep components small.
* Avoid overengineering.
* Use clear names.
* Add basic error handling.
* Make the app easy to run locally.

---

## Run Instructions

The generated project should include:

```bash
npm install
npm run dev
```

Optional `.env.local`:

```bash
OPENAI_API_KEY=your_api_key_here
```

If the key is missing, the project must still work using mock analysis.

---

## Success Criteria

The MVP is successful if:

* user can enter a business idea
* app generates a structured report
* report is understandable and useful
* risks and recommendations are visible
* final scores are shown
* demo works without API key
* project can be presented after 24 hours of work

```
```

