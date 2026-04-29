import { redirect } from "next/navigation";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import BrokerAvatar from "@/components/BrokerAvatar";
import type { Profile } from "@/lib/types";

export default async function ClientsPage() {
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

  const admin = createAdminClient();

  const { data: clientProfiles } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "buyer")
    .order("full_name");

  const { data: usersPage } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const emailMap = new Map(
    (usersPage?.users ?? []).map((u) => [u.id, u.email])
  );

  const clients = (clientProfiles ?? []) as Profile[];

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 8, mb: 12, px: { xs: 2, sm: 3 } }}>
        {/* Header */}
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
              Clients
            </Typography>
            <Typography variant="body1" sx={{ color: "#737688" }}>
              All clients in your network.
            </Typography>
          </Box>

          <Link href="/clients/new" style={{ textDecoration: "none" }}>
            <Button variant="contained" startIcon={<AddIcon />}>
              New Client
            </Button>
          </Link>
        </Box>

        {/* Table */}
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ border: "1px solid #e1e1ef", borderRadius: 2 }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 48 }} />
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Member since</TableCell>
                <TableCell align="right" sx={{ width: 64 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: "center", py: 6, color: "#737688" }}>
                    No clients yet. Add your first client to get started.
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell sx={{ pr: 0 }}>
                      <BrokerAvatar
                        fullName={c.full_name}
                        avatarUrl={c.avatar_url}
                        size={36}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: "#191b25" }}>
                        {c.full_name ?? "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: "#434656" }}>
                        {emailMap.get(c.id) ?? "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: "#737688" }}>
                        {new Date(c.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Link href={`/clients/${c.id}`} style={{ textDecoration: "none" }}>
                        <IconButton size="small" sx={{ color: "#737688" }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </>
  );
}
