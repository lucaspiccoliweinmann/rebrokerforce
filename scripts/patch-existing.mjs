import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const SUPABASE_URL     = "https://skwkjawndhppzamvfuza.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrd2tqYXduZGhwcHphbXZmdXphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njk1MzQ2OCwiZXhwIjoyMDkyNTI5NDY4fQ.sfYrZbQuWyg_kGZWULv3ak22MKR0Wlm_C4s6isH0n_M";
const AVATARS_DIR      = "/Users/lucaswein/Downloads/Avatars";

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PATCH = [
  { email: "alexander@test.com", fullName: "Alexander Anderson", file: "Alexander Anderson.png", role: "broker" },
  { email: "milena@test.com",    fullName: "Milena Maria",        file: "milenamaria.png",        role: "buyer"  },
];

for (const user of PATCH) {
  process.stdout.write(`Patching ${user.fullName} … `);

  // Look up user by email
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const authUser = list?.users.find(u => u.email === user.email);

  if (!authUser) { console.log("not found — skipping"); continue; }

  const id = authUser.id;

  // Update profile
  await admin.from("profiles")
    .update({ role: user.role, full_name: user.fullName })
    .eq("id", id);

  // Upload avatar
  const buffer = fs.readFileSync(path.join(AVATARS_DIR, user.file));
  const blob   = new Blob([buffer], { type: "image/png" });

  await admin.storage.from("avatars").upload(id, blob, {
    upsert: true, contentType: "image/png", cacheControl: "3600",
  });

  const { data: { publicUrl } } = admin.storage.from("avatars").getPublicUrl(id);
  await admin.from("profiles").update({ avatar_url: publicUrl }).eq("id", id);

  console.log("✓");
}

console.log("Done.");
