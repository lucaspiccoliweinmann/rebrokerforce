"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateProfile(input: {
  fullName: string;
  email?: string;
}): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthenticated" };

  const admin = createAdminClient();

  const { error: profileErr } = await admin
    .from("profiles")
    .update({ full_name: input.fullName })
    .eq("id", user.id);

  if (profileErr) return { error: profileErr.message };

  if (input.email && input.email !== user.email) {
    const { error: authErr } = await admin.auth.admin.updateUserById(user.id, {
      email: input.email,
    });
    if (authErr) return { error: authErr.message };
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return {};
}

export async function updateProfileAvatar(
  avatarUrl: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthenticated" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return {};
}
