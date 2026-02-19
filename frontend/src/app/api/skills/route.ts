import { NextRequest, NextResponse } from "next/server";
import { aiFindSkills } from "@/lib/gemini";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { job_description, resume_text = "", role_title = "" } = body;

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

    const result = await aiFindSkills(
      job_description,
      resume_text,
      role_title,
      apiKey
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Skills finder error:", error);
    const msg: string = error?.message || "";
    const isKeyError =
      msg.includes("API key expired") ||
      msg.includes("INVALID_ARGUMENT") ||
      msg.includes("Please renew the API key");
    return NextResponse.json(
      {
        detail: isKeyError
          ? "Your Google API key has expired. Please renew it and update GOOGLE_API_KEY in frontend/.env.local."
          : "Skills analysis failed. Please try again.",
      },
      { status: isKeyError ? 503 : 500 }
    );
  }
}
