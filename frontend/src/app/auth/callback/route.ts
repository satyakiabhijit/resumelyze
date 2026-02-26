import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { welcomeEmail, sendEmail } from "@/lib/emails";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/analyzer";

  if (code) {
    const supabase = createClient();
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && sessionData?.user) {
      const user = sessionData.user;

      // Send welcome email only on true first sign-up
      // (created_at ≈ confirmed_at means brand-new account)
      try {
        const createdAt = new Date(user.created_at).getTime();
        const confirmedAt = user.email_confirmed_at
          ? new Date(user.email_confirmed_at).getTime()
          : null;
        const isNewUser = confirmedAt === null || Math.abs(confirmedAt - createdAt) < 30_000;

        if (isNewUser && user.email) {
          // Grab full name from profile if available
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .single();

          const { subject, html, text } = welcomeEmail(profile?.full_name ?? user.user_metadata?.full_name);
          await sendEmail({ to: user.email, subject, html, text });
        }
      } catch {
        // Email failure must never block login
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth error — redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
