import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET — fetch analysis history for current user
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("analysis_history")
    .select("id, resume_filename, job_description_preview, analysis_mode, jd_match, ats_score, readability_score, overall_grade, missing_keywords, found_keywords, full_result, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("history GET error:", error.message);
    return NextResponse.json({ detail: "Failed to fetch history" }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST — save a new analysis result
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const {
    resume_filename,
    job_description,
    result,
  } = body;

  const { data, error } = await supabase
    .from("analysis_history")
    .insert({
      user_id: user.id,
      resume_filename: resume_filename || null,
      job_description_preview: job_description ? job_description.slice(0, 200) : null,
      analysis_mode: result?.analysis_mode || null,
      jd_match: result?.jd_match ?? null,
      ats_score: result?.ats_score ?? null,
      readability_score: result?.readability_score ?? null,
      overall_grade: result?.overall_grade || null,
      missing_keywords: result?.missing_keywords || null,
      found_keywords: result?.found_keywords || null,
      full_result: result,
    })
    .select()
    .single();

  if (error) {
    console.error("history POST error:", error.message);
    return NextResponse.json({ detail: "Failed to save analysis" }, { status: 500 });
  }

  // ── Enforce max 5 reports per user — delete oldest if over limit ──
  const { data: allRows } = await supabase
    .from("analysis_history")
    .select("id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (allRows && allRows.length > 5) {
    const toDelete = allRows.slice(5).map((r: { id: string }) => r.id);
    await supabase
      .from("analysis_history")
      .delete()
      .in("id", toDelete)
      .eq("user_id", user.id);
  }

  return NextResponse.json(data);
}

// DELETE — delete a specific analysis
export async function DELETE(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ detail: "Missing id" }, { status: 400 });
  }

  const { error } = await supabase
    .from("analysis_history")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("history DELETE error:", error.message);
    return NextResponse.json({ detail: "Failed to delete analysis" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
