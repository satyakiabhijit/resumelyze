import { NextRequest, NextResponse } from "next/server";

const ML_SERVER = process.env.ML_SERVER_URL || "http://127.0.0.1:8100";

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

    // Call local ML server for skills analysis
    const res = await fetch(`${ML_SERVER}/skills`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        job_description,
        resume_text,
        role_title,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`ML server error (${res.status}): ${detail}`);
    }

    const result = await res.json();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Skills finder error:", error);
    return NextResponse.json(
      {
        detail: error.message?.includes("fetch")
          ? "ML server is not running. Start it with: cd ml-server && python -m app.main"
          : "Skills analysis failed. Please try again.",
      },
      { status: 503 }
    );
  }
}
