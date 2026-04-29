import { redirect, notFound } from "next/navigation";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { createClient } from "@/lib/supabase/server";
import EngagementForm from "@/components/EngagementForm";
import type { Engagement, EngagementFile, Profile } from "@/lib/types";

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

  const [
    { data: engagement },
    { data: buyers },
    { data: brokers },
    { data: files },
  ] = await Promise.all([
    supabase.from("engagements").select("*").eq("id", id).single(),
    supabase.from("profiles").select("*").eq("role", "buyer").order("full_name"),
    supabase.from("profiles").select("*").eq("role", "broker").order("full_name"),
    supabase.from("engagement_files").select("*").eq("engagement_id", id).order("uploaded_at"),
  ]);

  if (!engagement) notFound();

  const engagementWithFiles: Engagement = {
    ...(engagement as Engagement),
    files: (files ?? []) as EngagementFile[],
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 8, mb: 12, px: { xs: 2, sm: 3 } }}>
      <Typography variant="h2" sx={{ mb: 1 }}>
        {engagement.name ?? "Edit Engagement"}
      </Typography>
      <Typography variant="body1" sx={{ color: "#737688", mb: 6 }}>
        Update participants, notes, or files for this engagement.
      </Typography>
      <EngagementForm
        buyers={(buyers ?? []) as Profile[]}
        brokers={(brokers ?? []) as Profile[]}
        engagement={engagementWithFiles}
      />
    </Container>
  );
}
