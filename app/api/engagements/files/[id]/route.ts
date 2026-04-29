import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "engagement-files";

interface Props {
  params: Promise<{ id: string }>;
}

export async function DELETE(_req: NextRequest, { params }: Props) {
  const { id } = await params;

  // 1. Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const admin = createAdminClient();

  // 2. Look up the file record to get the storage path
  const { data: fileRecord, error: fetchErr } = await admin
    .from("engagement_files")
    .select("file_url, engagement_id")
    .eq("id", id)
    .single();

  if (fetchErr || !fileRecord) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // 3. Derive storage path from public URL
  //    URL format: .../storage/v1/object/public/engagement-files/<path>
  const marker = `/object/public/${BUCKET}/`;
  const markerIdx = fileRecord.file_url.indexOf(marker);
  if (markerIdx !== -1) {
    const storagePath = fileRecord.file_url.slice(markerIdx + marker.length);
    await admin.storage.from(BUCKET).remove([storagePath]);
  }

  // 4. Delete DB record
  const { error: dbError } = await admin
    .from("engagement_files")
    .delete()
    .eq("id", id);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
