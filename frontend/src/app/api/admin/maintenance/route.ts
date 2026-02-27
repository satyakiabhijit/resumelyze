import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, supabase };
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  return { ok: !!profile?.is_admin, supabase };
}

// GET — public-ish read (used by middleware + admin UI)
// Uses anon client — site_settings has a public-read RLS policy
export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "maintenance_mode")
    .single();

  if (error) {
    // Table may not exist yet — treat as off
    return NextResponse.json({ maintenance: false });
  }
  return NextResponse.json({ maintenance: data?.value === "true" });
}

// POST — admin only toggle
export async function POST(req: Request) {
  const { ok } = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { enabled } = await req.json();

  const admin = getAdminClient();
  const { error } = await admin.from("site_settings").upsert(
    {
      key: "maintenance_mode",
      value: String(!!enabled),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, maintenance: !!enabled });
}
