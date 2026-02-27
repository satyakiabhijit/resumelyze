import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/* POST — admin: upload a template preview image to Supabase Storage */
export async function POST(req: NextRequest) {
  // Use regular client only for auth/admin check
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return NextResponse.json({ detail: "Forbidden" }, { status: 403 });

  // Parse multipart form
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ detail: "No file provided" }, { status: 400 });

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { detail: "Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed." },
      { status: 400 }
    );
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `template-${Date.now()}.${ext}`;

  // Use service role key to bypass RLS for storage upload
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await adminClient.storage
    .from("template-images")
    .upload(filename, await file.arrayBuffer(), {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) return NextResponse.json({ detail: error.message }, { status: 500 });

  const { data: urlData } = adminClient.storage
    .from("template-images")
    .getPublicUrl(data.path);

  return NextResponse.json({ url: urlData.publicUrl });
}
