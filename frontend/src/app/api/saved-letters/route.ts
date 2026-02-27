import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET — fetch saved cover letters for current user
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("cover_letters")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("saved-letters GET error:", error.message);
    return NextResponse.json({ detail: "Failed to fetch cover letters" }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST — save a cover letter
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
    company_name,
    role_title,
    tone,
    cover_letter_text,
    word_count,
    job_description,
  } = body;

  const { data, error } = await supabase
    .from("cover_letters")
    .insert({
      user_id: user.id,
      title: `${role_title || "Cover Letter"} — ${company_name || "General"}`,
      company_name: company_name || null,
      role_title: role_title || null,
      tone: tone || "professional",
      cover_letter_text,
      word_count: word_count || null,
      job_description_preview: job_description ? job_description.slice(0, 200) : null,
    })
    .select()
    .single();

  if (error) {
    console.error("saved-letters POST error:", error.message);
    return NextResponse.json({ detail: "Failed to save cover letter" }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE — delete a cover letter
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
    .from("cover_letters")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("saved-letters DELETE error:", error.message);
    return NextResponse.json({ detail: "Failed to delete cover letter" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
