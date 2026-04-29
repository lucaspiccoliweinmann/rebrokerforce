import { redirect } from "next/navigation";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import AddIcon from "@mui/icons-material/Add";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import EngagementTable from "@/components/EngagementTable";
import type { Engagement, Profile } from "@/lib/types";

export default async function EngagementsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");
  const p = profile as Profile;

  let query = supabase
    .from("engagements")
    .select("*, buyer:profiles!engagements_buyer_id_fkey(*), broker:profiles!engagements_broker_id_fkey(*)")
    .order("created_at", { ascending: false });

  if (p.role === "buyer") query = query.eq("buyer_id", user.id);
  if (p.role === "broker") query = query.eq("broker_id", user.id);

  const { data: engagements } = await query;

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 8, mb: 12, px: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            mb: 6,
          }}
        >
          <Box>
            <Typography variant="h2" sx={{ mb: 1 }}>
              Engagements
            </Typography>
            <Typography variant="body1" sx={{ color: "#737688" }}>
              {p.role === "admin"
                ? "All buyer–broker engagements across your operations."
                : "Your active engagements."}
            </Typography>
          </Box>

          {p.role === "admin" && (
            <Link href="/engagements/new" style={{ textDecoration: "none" }}>
              <Button variant="contained" startIcon={<AddIcon />}>
                New Engagement
              </Button>
            </Link>
          )}
        </Box>

        <EngagementTable
          engagements={(engagements ?? []) as Engagement[]}
          isAdmin={p.role === "admin"}
        />
      </Container>
    </>
  );
}
