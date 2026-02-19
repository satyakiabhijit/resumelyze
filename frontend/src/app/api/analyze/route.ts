import { NextRequest, NextResponse } from "next/server";
import { analyzeLocally } from "@/lib/analyzer";
import { aiAnalyze } from "@/lib/gemini";
import { extractTextFromFile } from "@/lib/pdf-parser";

export const maxDuration = 60; // Vercel serverless timeout (seconds)
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let resumeText = "";
    let jobDescription = "";
    let mode = "ai";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      jobDescription = (formData.get("job_description") as string) || "";
      mode = (formData.get("mode") as string) || "ai";
      resumeText = (formData.get("resume_text") as string) || "";

      // Handle file upload
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
      mode = body.mode || "ai";
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

    const apiKey = process.env.GOOGLE_API_KEY || "";
    const aiAvailable = apiKey.length > 0;

    /** Returns true when the error is an API key problem (expired / invalid). */
    function isKeyError(e: any): boolean {
      const msg: string = e?.message || "";
      return (
        msg.includes("API key expired") ||
        msg.includes("INVALID_ARGUMENT") ||
        msg.includes("API_KEY_INVALID") ||
        msg.includes("Please renew the API key")
      );
    }

    // Run analysis
    if (mode === "ai") {
      if (!aiAvailable) {
        return NextResponse.json(
          { detail: "AI mode requires GOOGLE_API_KEY environment variable" },
          { status: 503 }
        );
      }
      try {
        const result = await aiAnalyze(resumeText, jobDescription, apiKey);
        return NextResponse.json(result);
      } catch (e: any) {
        if (isKeyError(e)) {
          // Key is expired — transparently fall back to local NLP
          const localResult = analyzeLocally(resumeText, jobDescription);
          localResult.analysis_mode = "local (AI key expired)";
          return NextResponse.json(localResult);
        }
        throw e;
      }
    }

    if (mode === "local") {
      const result = analyzeLocally(resumeText, jobDescription);
      return NextResponse.json(result);
    }

    // Hybrid mode
    const localResult = analyzeLocally(resumeText, jobDescription);

    if (aiAvailable) {
      try {
        const aiResult = await aiAnalyze(resumeText, jobDescription, apiKey);

        // Merge results
        const merged = { ...aiResult };
        merged.jd_match = Math.round((localResult.jd_match + aiResult.jd_match) / 2);
        merged.ats_score = Math.round((localResult.ats_score + aiResult.ats_score) / 2);
        merged.readability_score = Math.round(
          (localResult.readability_score + (aiResult.readability_score || localResult.readability_score)) / 2
        );

        // Merge keywords (union)
        merged.missing_keywords = [...new Set([...localResult.missing_keywords, ...aiResult.missing_keywords])].slice(0, 20);
        merged.found_keywords = [...new Set([...localResult.found_keywords, ...aiResult.found_keywords])].slice(0, 20);

        // Merge section scores (average)
        const allSections = new Set([
          ...Object.keys(localResult.section_scores),
          ...Object.keys(aiResult.section_scores),
        ]);
        for (const section of allSections) {
          const localSec = localResult.section_scores[section] || { score: 0, suggestion: "" };
          const aiSec = aiResult.section_scores[section] || { score: 0, suggestion: "" };
          merged.section_scores[section] = {
            score: Math.round((localSec.score + aiSec.score) / 2),
            suggestion: aiSec.suggestion || localSec.suggestion,
          };
        }

        merged.analysis_mode = "hybrid";
        return NextResponse.json(merged);
      } catch (e: any) {
        const reason = isKeyError(e) ? "AI key expired" : "AI error";
        console.warn(`AI failed in hybrid mode (${reason}), falling back to local:`, e.message);
        localResult.analysis_mode = `local (${reason})`;
        return NextResponse.json(localResult);
      }
    }

    localResult.analysis_mode = "local (no AI key)";
    return NextResponse.json(localResult);
  } catch (error: any) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { detail: error.message || "Analysis failed" },
      { status: 500 }
    );
  }
}
