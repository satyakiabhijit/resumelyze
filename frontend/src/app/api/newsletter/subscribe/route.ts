import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// POST — public subscribe endpoint
export async function POST(req: NextRequest) {
  const { email, name } = await req.json();
  if (!email?.trim()) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("newsletter_subscribers")
    .upsert(
      {
        email: email.trim().toLowerCase(),
        name: name?.trim() ?? null,
        user_id: user?.id ?? null,
        is_active: true,
        unsubscribed_at: null,
      },
      { onConflict: "email" }
    );

  if (error) return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  return NextResponse.json({ success: true });
}
