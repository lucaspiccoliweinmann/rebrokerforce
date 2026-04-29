import { redirect, notFound } from "next/navigation";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { createClient } from "@/lib/supabase/server";
import EngagementForm from "@/components/EngagementForm";
import type { Engagement, Profile } from "@/lib/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditEngagementPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || (profile as Profile).role !== "admin") redirect("/dashboard");

  const { data: engagement } = await supabase
    .from("engagements")
    .select("*")
    .eq("id", id)
    .single();

  if (!engagement) notFound();

  const { data: buyers } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "buyer")
    .order("full_name");

  const { data: brokers } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "broker")
    .order("full_name");

  return (
    <>
      <Container maxWidth="sm" sx={{ mt: 8, mb: 12, px: { xs: 2, sm: 3 } }}>
        <Typography variant="h2" sx={{ mb: 1 }}>
          Edit Engagement
        </Typography>
        <Typography variant="body1" sx={{ color: "#737688", mb: 6 }}>
          Update status, notes, or participants for this engagement.
        </Typography>
        <Paper
          elevation={0}
          sx={{ p: { xs: 3, sm: 4 }, border: "1px solid #e1e1ef", borderRadius: 2 }}
        >
          <EngagementForm
            buyers={(buyers ?? []) as Profile[]}
            brokers={(brokers ?? []) as Profile[]}
            engagement={engagement as Engagement}
          />
        </Paper>
      </Container>
    </>
  );
}
