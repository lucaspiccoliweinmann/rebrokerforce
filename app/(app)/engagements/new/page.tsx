import { redirect } from "next/navigation";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { createClient } from "@/lib/supabase/server";
import EngagementForm from "@/components/EngagementForm";
import type { Profile } from "@/lib/types";

export default async function NewEngagementPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || (profile as Profile).role !== "admin") redirect("/dashboard");

  const [{ data: buyers }, { data: brokers }] = await Promise.all([
    supabase.from("profiles").select("*").eq("role", "buyer").order("full_name"),
    supabase.from("profiles").select("*").eq("role", "broker").order("full_name"),
  ]);

  return (
    <Container maxWidth="lg" sx={{ mt: 8, mb: 12, px: { xs: 2, sm: 3 } }}>
      <Typography variant="h2" sx={{ mb: 1 }}>
        New Engagement
      </Typography>
      <Typography variant="body1" sx={{ color: "#737688", mb: 6 }}>
        Associate a client with a broker and add notes or files.
      </Typography>
      <EngagementForm
        buyers={(buyers ?? []) as Profile[]}
        brokers={(brokers ?? []) as Profile[]}
      />
    </Container>
  );
}
