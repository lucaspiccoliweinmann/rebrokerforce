import { redirect, notFound } from "next/navigation";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import BrokerForm from "@/components/BrokerForm";
import type { Profile } from "@/lib/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBrokerPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || (profile as Profile).role !== "admin") redirect("/dashboard");

  // Load the broker's profile row
  const { data: broker } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .eq("role", "broker")
    .single();

  if (!broker) notFound();

  // Fetch email from auth via admin API
  const admin = createAdminClient();
  const { data: authUser } = await admin.auth.admin.getUserById(id);
  const email = authUser?.user?.email ?? "";

  return (
    <>
      <Container maxWidth="sm" sx={{ mt: 8, mb: 12, px: { xs: 2, sm: 3 } }}>
        <Typography variant="h2" sx={{ mb: 1 }}>
          Edit Broker
        </Typography>
        <Typography variant="body1" sx={{ color: "#737688", mb: 6 }}>
          Update this broker's name or email address.
        </Typography>
        <Paper
          elevation={0}
          sx={{ p: { xs: 3, sm: 4 }, border: "1px solid #e1e1ef", borderRadius: 2 }}
        >
          <BrokerForm broker={{ ...(broker as Profile), email }} />
        </Paper>
      </Container>
    </>
  );
}
