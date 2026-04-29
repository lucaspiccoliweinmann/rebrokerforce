import { redirect } from "next/navigation";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import Link from "next/link";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { createClient } from "@/lib/supabase/server";
import BrokerAvatar from "@/components/BrokerAvatar";
import type { Profile, Engagement } from "@/lib/types";

// ── Status chip colours ───────────────────────────────────────────────────────
const statusStyle: Record<string, { bg: string; color: string }> = {
  active:  { bg: "#e6f0ff", color: "#003ec7" },
  pending: { bg: "#fff3e0", color: "#b45000" },
  closed:  { bg: "#f0f0f5", color: "#737688" },
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Alert severity="error">
          Profile not found for user <strong>{user.email}</strong>.<br />
          Please contact your administrator to set up your account.
        </Alert>
      </Container>
    );
  }

  const p = profile as Profile;
  const isAdmin = p.role === "admin";

  // ── Data fetching (admin only) ──────────────────────────────────────────────
  let brokerCount = 0;
  let clientCount = 0;
  let engagementCount = 0;
  let recentBrokers: Profile[] = [];
  let recentClients: Profile[] = [];
  let recentEngagements: (Engagement & { buyer: Profile; broker: Profile })[] = [];

  if (isAdmin) {
    const [
      { count: bc },
      { count: cc },
      { count: ec },
      { data: rb },
      { data: rc },
      { data: re },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "broker"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "buyer"),
      supabase.from("engagements").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*").eq("role", "broker").order("created_at", { ascending: false }).limit(3),
      supabase.from("profiles").select("*").eq("role", "buyer").order("created_at", { ascending: false }).limit(3),
      supabase
        .from("engagements")
        .select("*, buyer:profiles!engagements_buyer_id_fkey(*), broker:profiles!engagements_broker_id_fkey(*)")
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

    brokerCount     = bc ?? 0;
    clientCount     = cc ?? 0;
    engagementCount = ec ?? 0;
    recentBrokers   = (rb ?? []) as Profile[];
    recentClients   = (rc ?? []) as Profile[];
    recentEngagements = (re ?? []) as (Engagement & { buyer: Profile; broker: Profile })[];
  }

  // ── Shared card styles ──────────────────────────────────────────────────────
  const navCard = {
    p: 3,
    height: "100%",
    cursor: "pointer",
    transition: "border-color 150ms ease",
    "&:hover": { borderColor: "#737688" },
  };

  const cardTitle = {
    fontFamily: "'Newsreader14', Georgia, serif",
    fontWeight: 500,
    fontSize: 18,
    mb: 0.5,
    color: "#191b25",
  };

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 8, mb: 14, px: { xs: 2, sm: 3 } }}>

        {/* ── Page header ── */}
        <Typography variant="h2" sx={{ mb: 1 }}>
          Welcome back{p.full_name ? `, ${p.full_name}` : ""}
        </Typography>
        <Typography variant="body1" sx={{ color: "#737688", mb: 8 }}>
          {isAdmin
            ? "Here's what's happening across your operations."
            : "View your active engagements and compliance status."}
        </Typography>

        {isAdmin ? (
          <>
            {/* ── Stat cards ── */}
            <Grid container spacing={3} sx={{ mb: 8 }}>
              {[
                { label: "Brokers",     count: brokerCount,     href: "/brokers"     },
                { label: "Clients",     count: clientCount,     href: "/clients"     },
                { label: "Engagements", count: engagementCount, href: "/engagements" },
              ].map(({ label, count, href }) => (
                <Grid key={label} size={{ xs: 12, sm: 4 }}>
                  <Link href={href} style={{ textDecoration: "none", display: "block" }}>
                    <Card sx={navCard}>
                      <CardContent sx={{ p: 0 }}>
                        <Typography
                          sx={{
                            fontFamily: "'Newsreader60', Georgia, serif",
                            fontSize: 48,
                            fontWeight: 500,
                            lineHeight: 1,
                            color: "#191b25",
                            mb: 1,
                          }}
                        >
                          {count}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <Typography variant="body2" sx={{ color: "#737688", fontWeight: 500 }}>
                            {label}
                          </Typography>
                          <ArrowForwardIcon sx={{ fontSize: 14, color: "#c3c5d9" }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Link>
                </Grid>
              ))}
            </Grid>

            {/* ── Recent engagements ── */}
            <SectionHeader title="Recent Engagements" href="/engagements" />
            <Card sx={{ mb: 8, overflow: "hidden" }}>
              {recentEngagements.length === 0 ? (
                <Box sx={{ p: 4, textAlign: "center", color: "#737688" }}>
                  <Typography variant="body2">No engagements yet.</Typography>
                </Box>
              ) : (
                recentEngagements.map((eng, i) => {
                  const ss = statusStyle[eng.status] ?? statusStyle.closed;
                  return (
                    <Box key={eng.id}>
                      <Link href={`/engagements/${eng.id}`} style={{ textDecoration: "none" }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            px: 3,
                            py: 2,
                            transition: "background 120ms ease",
                            "&:hover": { bgcolor: "#fbf8ff" },
                          }}
                        >
                          {/* Buyer → Broker */}
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1, minWidth: 0 }}>
                            <BrokerAvatar fullName={eng.buyer?.full_name} avatarUrl={eng.buyer?.avatar_url} size={32} />
                            <Typography variant="body2" sx={{ fontWeight: 500, color: "#191b25", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {eng.buyer?.full_name ?? "—"}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#c3c5d9", flexShrink: 0 }}>→</Typography>
                            <BrokerAvatar fullName={eng.broker?.full_name} avatarUrl={eng.broker?.avatar_url} size={32} />
                            <Typography variant="body2" sx={{ fontWeight: 500, color: "#191b25", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {eng.broker?.full_name ?? "—"}
                            </Typography>
                          </Box>

                          {/* Status + date */}
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
                            <Chip
                              label={eng.status}
                              size="small"
                              sx={{
                                bgcolor: ss.bg,
                                color: ss.color,
                                fontWeight: 600,
                                fontSize: 11,
                                letterSpacing: "0.05em",
                                textTransform: "uppercase",
                                height: 22,
                              }}
                            />
                            <Typography variant="caption" sx={{ color: "#737688", minWidth: 80, textAlign: "right" }}>
                              {new Date(eng.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </Typography>
                          </Box>
                        </Box>
                      </Link>
                      {i < recentEngagements.length - 1 && <Divider />}
                    </Box>
                  );
                })
              )}
            </Card>

            {/* ── Recent clients + brokers ── */}
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 6 }}>
                <SectionHeader title="Recent Clients" href="/clients" />
                <PeopleCard people={recentClients} baseHref="/clients" />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <SectionHeader title="Recent Brokers" href="/brokers" />
                <PeopleCard people={recentBrokers} baseHref="/brokers" />
              </Grid>
            </Grid>
          </>
        ) : (
          /* ── Non-admin: simple nav card ── */
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Link href="/engagements" style={{ textDecoration: "none", display: "block", height: "100%" }}>
                <Card sx={navCard}>
                  <CardContent sx={{ p: 0 }}>
                    <Typography variant="h6" sx={cardTitle}>My Engagements</Typography>
                    <Typography variant="body2" sx={{ color: "#737688" }}>
                      View your active engagements.
                    </Typography>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          </Grid>
        )}
      </Container>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
      <Typography
        sx={{
          fontFamily: "'Newsreader14', Georgia, serif",
          fontSize: 16,
          fontWeight: 500,
          color: "#191b25",
        }}
      >
        {title}
      </Typography>
      <Link href={href} style={{ textDecoration: "none" }}>
        <Typography
          variant="caption"
          sx={{
            color: "#0052ff",
            fontWeight: 600,
            letterSpacing: "0.04em",
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            "&:hover": { opacity: 0.75 },
          }}
        >
          View all <ArrowForwardIcon sx={{ fontSize: 12 }} />
        </Typography>
      </Link>
    </Box>
  );
}

function PeopleCard({ people, baseHref }: { people: Profile[]; baseHref: string }) {
  if (people.length === 0) {
    return (
      <Card>
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: "#737688" }}>None yet.</Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card sx={{ overflow: "hidden" }}>
      {people.map((person, i) => (
        <Box key={person.id}>
          <Link href={`${baseHref}/${person.id}`} style={{ textDecoration: "none" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                px: 3,
                py: 2,
                transition: "background 120ms ease",
                "&:hover": { bgcolor: "#fbf8ff" },
              }}
            >
              <BrokerAvatar fullName={person.full_name} avatarUrl={person.avatar_url} size={36} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: "#191b25" }}>
                  {person.full_name ?? "—"}
                </Typography>
                <Typography variant="caption" sx={{ color: "#737688" }}>
                  Joined {new Date(person.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </Typography>
              </Box>
            </Box>
          </Link>
          {i < people.length - 1 && <Divider />}
        </Box>
      ))}
    </Card>
  );
}
