import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.GOOGLE_API_KEY || "";
  const aiAvailable = apiKey.length > 0;

  const modes = [
    {
      id: "local",
      name: "Local NLP",
      available: true,
      description: "Keyword matching & NLP analysis — no API key needed",
    },
    {
      id: "ai",
      name: "AI (Gemini)",
      available: aiAvailable,
      description: aiAvailable
        ? "Full AI-powered analysis using Google Gemini"
        : "Requires GOOGLE_API_KEY environment variable",
    },
    {
      id: "hybrid",
      name: "Hybrid",
      available: aiAvailable,
      description: aiAvailable
        ? "Best of both — local NLP + AI enhancement"
        : "Requires GOOGLE_API_KEY environment variable",
    },
  ];

  return NextResponse.json({
    modes,
    default: aiAvailable ? "ai" : "local",
  });
}
