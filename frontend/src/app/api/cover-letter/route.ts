import { NextRequest, NextResponse } from "next/server";
import { aiGenerateCoverLetter } from "@/lib/gemini";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      resume_text,
      job_description,
      tone = "professional",
      company_name = "",
      role_title = "",
    } = body;

    if (!resume_text || resume_text.trim().length < 50) {
      return NextResponse.json(
        { detail: "Resume text is too short (minimum 50 characters)" },
        { status: 400 }
      );
    }
    if (!job_description || job_description.trim().length < 10) {
      return NextResponse.json(
        { detail: "Job description is too short (minimum 10 characters)" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_API_KEY || "";
    if (!apiKey) {
      return NextResponse.json(
        { detail: "AI features require GOOGLE_API_KEY environment variable" },
        { status: 503 }
      );
    }

    const result = await aiGenerateCoverLetter(
      resume_text,
      job_description,
      tone,
      company_name,
      role_title,
      apiKey
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Cover letter generation error:", error);
    const msg: string = error?.message || "";
    const isKeyError =
      msg.includes("API key expired") ||
      msg.includes("INVALID_ARGUMENT") ||
      msg.includes("Please renew the API key");
    return NextResponse.json(
      {
        detail: isKeyError
          ? "Your Google API key has expired. Please renew it and update GOOGLE_API_KEY in frontend/.env.local."
          : "Cover letter generation failed. Please try again.",
      },
      { status: isKeyError ? 503 : 500 }
    );
  }
}
