"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ── Auth guard ────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") throw new Error("Unauthorized");
}

// ── Storage: ensure avatars bucket exists ─────────────────────────────────────

async function ensureAvatarsBucket() {
  const admin = createAdminClient();
  // createBucket is a no-op if the bucket already exists (we ignore the error)
  await admin.storage.createBucket("avatars", {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024, // 5 MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  });
}

// ── Create ────────────────────────────────────────────────────────────────────
// Returns the new broker's id so the client can upload an avatar before
// navigating away.

export async function createBroker(input: {
  fullName: string;
  email: string;
  password: string;
}): Promise<{ id?: string; error?: string }> {
  await requireAdmin();
  await ensureAvatarsBucket();

  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.fullName },
  });

  if (error) return { error: error.message };

  // Trigger creates the profile with role='buyer' — update to broker
  const { error: updateErr } = await admin
    .from("profiles")
    .update({ role: "broker", full_name: input.fullName })
    .eq("id", data.user.id);

  if (updateErr) return { error: updateErr.message };

  revalidatePath("/brokers");
  return { id: data.user.id };
}

// ── Update ────────────────────────────────────────────────────────────────────

export async function updateBroker(
  id: string,
  input: { fullName: string; email?: string }
): Promise<{ error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();

  const { error: profileErr } = await admin
    .from("profiles")
    .update({ full_name: input.fullName })
    .eq("id", id);

  if (profileErr) return { error: profileErr.message };

  if (input.email) {
    const { error: authErr } = await admin.auth.admin.updateUserById(id, {
      email: input.email,
    });
    if (authErr) return { error: authErr.message };
  }

  revalidatePath("/brokers");
  return {};
}

// ── Avatar ────────────────────────────────────────────────────────────────────

export async function updateBrokerAvatar(
  id: string,
  avatarUrl: string
): Promise<{ error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();

  const { error } = await admin
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/brokers");
  return {};
}

// ── Delete ────────────────────────────────────────────────────────────────────

export async function deleteBroker(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();

  // Remove avatar from storage (best-effort)
  await admin.storage.from("avatars").remove([id]);

  // Deleting the auth user cascades to profiles via FK
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return { error: error.message };

  revalidatePath("/brokers");
  redirect("/brokers");
}
