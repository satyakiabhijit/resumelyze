import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  return profile?.is_admin ? supabase : null;
}

// GET — list all users with counts
export async function GET(req: NextRequest) {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("profiles")
    .select("id, full_name, email, phone, location, headline, is_admin, created_at, updated_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data: users, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get analysis counts per user
  const userIds = (users ?? []).map((u: { id: string }) => u.id);
  const [{ data: analysisCounts }, { data: coverLetterCounts }] = await Promise.all([
    supabase
      .from("analysis_history")
      .select("user_id")
      .in("user_id", userIds),
    supabase
      .from("cover_letters")
      .select("user_id")
      .in("user_id", userIds),
  ]);

  const analysisMap = (analysisCounts ?? []).reduce<Record<string, number>>((acc: Record<string, number>, r: { user_id: string }) => {
    acc[r.user_id] = (acc[r.user_id] ?? 0) + 1;
    return acc;
  }, {});
  const coverMap = (coverLetterCounts ?? []).reduce<Record<string, number>>((acc: Record<string, number>, r: { user_id: string }) => {
    acc[r.user_id] = (acc[r.user_id] ?? 0) + 1;
    return acc;
  }, {});

  const enriched = (users ?? []).map((u: Record<string, unknown> & { id: string }) => ({
    ...u,
    analysis_count: analysisMap[u.id] ?? 0,
    cover_letter_count: coverMap[u.id] ?? 0,
  }));

  return NextResponse.json({ users: enriched, total: count ?? 0, page, limit });
}

// PATCH — toggle is_admin
export async function PATCH(req: NextRequest) {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id, is_admin } = await req.json();
  const { error } = await supabase
    .from("profiles")
    .update({ is_admin })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
