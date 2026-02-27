import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { sendNewsletterBatch } from "@/lib/emails";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { admin: null, supabase };
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, id")
    .eq("id", user.id)
    .single();
  return { admin: profile?.is_admin ? user : null, supabase, adminId: user.id };
}

// GET — list subscribers + history
export async function GET(req: NextRequest) {
  const { admin, supabase } = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "subscribers";

  if (type === "history") {
    const { data, error } = await supabase
      .from("newsletters")
      .select("*, profiles(full_name, email)")
      .order("sent_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ history: data ?? [] });
  }

  const { data: subscribers, count, error } = await supabase
    .from("newsletter_subscribers")
    .select("*", { count: "exact" })
    .order("subscribed_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ subscribers: subscribers ?? [], total: count ?? 0 });
}

// POST — send newsletter
export async function POST(req: NextRequest) {
  const { admin, supabase, adminId } = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { subject, bodyHtml, bodyText } = await req.json();
  if (!subject?.trim() || !bodyHtml?.trim()) {
    return NextResponse.json({ error: "Subject and body are required" }, { status: 400 });
  }

  // Get active subscribers
  const { data: subscribers, error: subError } = await supabase
    .from("newsletter_subscribers")
    .select("email, name")
    .eq("is_active", true);

  if (subError) return NextResponse.json({ error: subError.message }, { status: 500 });
  const recipientCount = (subscribers ?? []).length;

  // Try sending via Resend using the branded newsletter template
  let sendError: string | null = null;
  if (process.env.RESEND_API_KEY && recipientCount > 0) {
    const { error: batchError } = await sendNewsletterBatch({
      recipients: (subscribers ?? []).map((s: { email: string; name: string | null }) => ({
        email: s.email,
        name: s.name,
      })),
      subject,
      bodyHtml,
    });
    if (batchError) sendError = batchError;
  }

  // Log the newsletter
  const { error: logError } = await supabase.from("newsletters").insert({
    subject,
    body_html: bodyHtml,
    body_text: bodyText ?? null,
    sent_by: adminId,
    recipient_count: recipientCount,
    status: sendError ? "failed" : "sent",
  });

  if (logError) return NextResponse.json({ error: logError.message }, { status: 500 });

  return NextResponse.json({
    success: true,
    recipientCount,
    emailSent: !!process.env.RESEND_API_KEY && !sendError,
    warning: !process.env.RESEND_API_KEY
      ? "RESEND_API_KEY not set — newsletter logged but not emailed."
      : sendError ?? undefined,
  });
}

// DELETE — remove a subscriber
export async function DELETE(req: NextRequest) {
  const { admin, supabase } = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await req.json();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .update({ is_active: false, unsubscribed_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
