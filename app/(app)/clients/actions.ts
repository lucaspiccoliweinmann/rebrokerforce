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

// ── Create ────────────────────────────────────────────────────────────────────

export async function createClientProfile(input: {
  fullName: string;
  email: string;
  password: string;
}): Promise<{ id?: string; error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.fullName },
  });

  if (error) return { error: error.message };

  // Trigger sets role='buyer' by default — just update full_name to be sure
  const { error: updateErr } = await admin
    .from("profiles")
    .update({ role: "buyer", full_name: input.fullName })
    .eq("id", data.user.id);

  if (updateErr) return { error: updateErr.message };

  revalidatePath("/clients");
  return { id: data.user.id };
}

// ── Update ────────────────────────────────────────────────────────────────────

export async function updateClientProfile(
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

  revalidatePath("/clients");
  return {};
}

// ── Avatar ────────────────────────────────────────────────────────────────────

export async function updateClientAvatar(
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

  revalidatePath("/clients");
  return {};
}

// ── Delete ────────────────────────────────────────────────────────────────────

export async function deleteClientProfile(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();

  await admin.storage.from("avatars").remove([id]);

  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return { error: error.message };

  revalidatePath("/clients");
  redirect("/clients");
}
