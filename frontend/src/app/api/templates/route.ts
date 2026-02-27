import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/* ─── helpers ───────────────────────────────── */

async function requireAdmin(supabase: ReturnType<typeof createClient>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return { user, error: "Forbidden — admin only" };

  return { user, error: null };
}

/* ─── GET — public: fetch all active templates ─── */
export async function GET() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("resume_templates")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

/* ─── POST — admin: create new template ─── */
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { error: authErr } = await requireAdmin(supabase);
  if (authErr) return NextResponse.json({ detail: authErr }, { status: authErr === "Not authenticated" ? 401 : 403 });

  const body = await req.json();
  const {
    name,
    author = "",
    description = "",
    category = [],
    tags = [],
    accent = "from-blue-600 to-blue-800",
    bg = "bg-blue-50",
    preview_image_url = null,
    sample_latex_code = "",
    recommended = [],
    is_active = true,
    sort_order = 0,
  } = body;

  if (!name) return NextResponse.json({ detail: "Name is required" }, { status: 400 });

  const { data, error } = await supabase
    .from("resume_templates")
    .insert({
      name,
      author,
      description,
      category,
      tags,
      accent,
      bg,
      preview_image_url,
      sample_latex_code,
      recommended,
      is_active,
      sort_order,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ detail: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}

/* ─── PUT — admin: update template ─── */
export async function PUT(req: NextRequest) {
  const supabase = createClient();
  const { error: authErr } = await requireAdmin(supabase);
  if (authErr) return NextResponse.json({ detail: authErr }, { status: authErr === "Not authenticated" ? 401 : 403 });

  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ detail: "Template id is required" }, { status: 400 });

  const { data, error } = await supabase
    .from("resume_templates")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ detail: error.message }, { status: 500 });

  return NextResponse.json(data);
}

/* ─── DELETE — admin: delete template ─── */
export async function DELETE(req: NextRequest) {
  const supabase = createClient();
  const { error: authErr } = await requireAdmin(supabase);
  if (authErr) return NextResponse.json({ detail: authErr }, { status: authErr === "Not authenticated" ? 401 : 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ detail: "Template id is required" }, { status: 400 });

  const { error } = await supabase
    .from("resume_templates")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ detail: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
