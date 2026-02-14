import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.GOOGLE_API_KEY || "";
  const aiAvailable = apiKey.length > 0;

  return NextResponse.json({
    status: "ok",
    version: "3.0.0",
    ai_available: aiAvailable,
    nlp_available: true,
  });
}
