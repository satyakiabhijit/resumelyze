import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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

export async function GET() {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const [
    { count: totalUsers },
    { count: totalAnalyses },
    { count: totalCoverLetters },
    { count: totalTemplates },
    { count: totalSubscribers },
    { count: activeTemplates },
    { data: recentUsers },
    { data: recentAnalyses },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("analysis_history").select("*", { count: "exact", head: true }),
    supabase.from("cover_letters").select("*", { count: "exact", head: true }),
    supabase.from("resume_templates").select("*", { count: "exact", head: true }),
    supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("resume_templates").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase
      .from("profiles")
      .select("id, full_name, email, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("analysis_history")
      .select("id, resume_filename, overall_grade, created_at, profiles(full_name, email)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  // Users signed up in last 7 days
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count: newUsersThisWeek } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", weekAgo);

  return NextResponse.json({
    stats: {
      totalUsers: totalUsers ?? 0,
      totalAnalyses: totalAnalyses ?? 0,
      totalCoverLetters: totalCoverLetters ?? 0,
      totalTemplates: totalTemplates ?? 0,
      activeTemplates: activeTemplates ?? 0,
      totalSubscribers: totalSubscribers ?? 0,
      newUsersThisWeek: newUsersThisWeek ?? 0,
    },
    recentUsers: recentUsers ?? [],
    recentAnalyses: recentAnalyses ?? [],
  });
}
