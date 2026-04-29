import { redirect } from "next/navigation";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "@/components/ProfileForm";
import type { Profile } from "@/lib/types";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 12, px: { xs: 2, sm: 3 } }}>
      <Typography variant="h2" sx={{ mb: 1 }}>
        Profile
      </Typography>
      <Typography variant="body1" sx={{ color: "#737688", mb: 6 }}>
        Update your name, email, or profile photo.
      </Typography>
      <Paper
        elevation={0}
        sx={{ p: { xs: 3, sm: 4 }, border: "1px solid #e1e1ef", borderRadius: 2 }}
      >
        <ProfileForm
          profile={profile as Profile}
          email={user.email ?? ""}
        />
      </Paper>
    </Container>
  );
}
