import { NextRequest, NextResponse } from "next/server";
import { extractTextFromFile } from "@/lib/pdf-parser";

const ML_SERVER = process.env.ML_SERVER_URL || "http://127.0.0.1:8100";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

/** Call the local ML server for analysis. */
async function mlAnalyze(resumeText: string, jobDescription: string) {
  const res = await fetch(`${ML_SERVER}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      resume_text: resumeText,
      job_description: jobDescription,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`ML server error (${res.status}): ${detail}`);
  }

  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let resumeText = "";
    let jobDescription = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      jobDescription = (formData.get("job_description") as string) || "";
      resumeText = (formData.get("resume_text") as string) || "";

      const file = formData.get("resume_file") as File | null;
      if (file && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (buffer.length > 10 * 1024 * 1024) {
          return NextResponse.json(
            { detail: "File too large. Max 10MB" },
            { status: 400 }
          );
        }

        resumeText = await extractTextFromFile(buffer, file.name);
      }
    } else {
      const body = await req.json();
      jobDescription = body.job_description || "";
      resumeText = body.resume_text || "";
    }

    // Validation
    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json(
        { detail: "Resume text is too short or empty (minimum 50 characters)" },
        { status: 400 }
      );
    }
    if (!jobDescription || jobDescription.trim().length < 10) {
      return NextResponse.json(
        { detail: "Job description is too short (minimum 10 characters)" },
        { status: 400 }
      );
    }

    try {
      const result = await mlAnalyze(resumeText, jobDescription);
      return NextResponse.json(result);
    } catch (e: any) {
      console.error("ML server error:", e.message);
      return NextResponse.json(
        { detail: "ML server is offline. Please start it with: cd ml-server && python -m app.main" },
        { status: 503 }
      );
    }
  } catch (error: any) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { detail: error.message || "Analysis failed" },
      { status: 500 }
    );
  }
}
