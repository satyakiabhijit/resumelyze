import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI service not configured" }, { status: 503 });
  }
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  try {
    const body = await req.json();
    const { jobTitle, yearsOfExperience, skills, tone, existingSummary } = body;

    if (!jobTitle) {
      return NextResponse.json({ error: "Job title is required" }, { status: 400 });
    }

    const prompt = `You are a Certified Professional Résumé Writer (CPRW). Generate a powerful, ATS-optimized professional resume summary.

Job Title: ${jobTitle}
Years of Experience: ${yearsOfExperience || "Not specified"}
Key Skills: ${skills || "Not specified"}
Tone: ${tone || "Professional"}
${existingSummary ? `Existing Summary to Improve: ${existingSummary}` : ""}

Generate 3 different resume summary variations (short, medium, and detailed). Each should be compelling, keyword-rich, and tailored for the target role.

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "summaries": [
    {
      "label": "Concise (2-3 sentences)",
      "text": "...",
      "wordCount": 40
    },
    {
      "label": "Standard (3-4 sentences)",
      "text": "...",
      "wordCount": 65
    },
    {
      "label": "Detailed (4-5 sentences)",
      "text": "...",
      "wordCount": 90
    }
  ],
  "keywordSuggestions": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "tips": ["tip1", "tip2", "tip3"]
}`;

    const res = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
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
    console.error("summary-generator error:", err instanceof Error ? err.message : "Unknown error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
