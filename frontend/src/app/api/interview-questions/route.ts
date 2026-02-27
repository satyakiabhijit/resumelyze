import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI service not configured" }, { status: 503 });
  }
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  try {
    const body = await req.json();
    const { jobTitle, company, experienceLevel, focusArea } = body;

    if (!jobTitle) {
      return NextResponse.json({ error: "Job title is required" }, { status: 400 });
    }

    const prompt = `You are an expert career coach and interview preparation specialist. Generate comprehensive interview questions for:

Job Title: ${jobTitle}
Company: ${company || "Not specified"}
Experience Level: ${experienceLevel || "Mid-level"}
Focus Area: ${focusArea || "General"}

Generate a well-structured set of interview questions with model answers and tips.

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "categories": [
    {
      "name": "Behavioral Questions",
      "icon": "Users",
      "questions": [
        {
          "question": "...",
          "tip": "Use the STAR method: Situation, Task, Action, Result",
          "sampleAnswer": "..."
        }
      ]
    },
    {
      "name": "Technical Questions",
      "icon": "Code",
      "questions": [
        {
          "question": "...",
          "tip": "...",
          "sampleAnswer": "..."
        }
      ]
    },
    {
      "name": "Situational Questions",
      "icon": "Lightbulb",
      "questions": [
        {
          "question": "...",
          "tip": "...",
          "sampleAnswer": "..."
        }
      ]
    },
    {
      "name": "Culture & Fit",
      "icon": "Heart",
      "questions": [
        {
          "question": "...",
          "tip": "...",
          "sampleAnswer": "..."
        }
      ]
    }
  ],
  "prepTips": ["tip1", "tip2", "tip3", "tip4"],
  "questionsToAsk": ["What does a typical day look like for this role?", "..."]
}

Include 3-4 questions per category. Make answers realistic and specific to the role.`;

    const res = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
      }),
    });

    if (!res.ok) {
      console.error("Gemini error:", res.status, res.statusText);
      return NextResponse.json({ error: "AI request failed" }, { status: 500 });
    }

    const data = await res.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const clean = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    const parsed = JSON.parse(clean);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("interview-questions error:", err instanceof Error ? err.message : "Unknown error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
