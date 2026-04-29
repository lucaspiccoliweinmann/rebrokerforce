import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  // 1. Verify the caller is an authenticated admin
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // 2. Parse the multipart body
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const brokerId = formData.get("brokerId") as string | null;

  if (!file || !brokerId) {
    return NextResponse.json({ error: "Missing file or brokerId" }, { status: 400 });
  }

  const admin = createAdminClient();

  // 3. Ensure the bucket exists (create if absent, ignore "already exists")
  await admin.storage.createBucket("avatars", {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  });

  // 4. Upload — the admin client bypasses all storage RLS
  const bytes = await file.arrayBuffer();
  const { error: uploadError } = await admin.storage
    .from("avatars")
    .upload(brokerId, bytes, {
      upsert: true,
      contentType: file.type,
      cacheControl: "3600",
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // 5. Return the public URL
  const { data } = admin.storage.from("avatars").getPublicUrl(brokerId);
  return NextResponse.json({ publicUrl: data.publicUrl });
}
