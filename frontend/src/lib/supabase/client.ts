import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // Uses document.cookie automatically; 3-day maxAge is enforced server-side in middleware.ts
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
