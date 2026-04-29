import { redirect } from "next/navigation";
import Box from "@mui/material/Box";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";
import type { Profile } from "@/lib/types";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  if (!profile) redirect("/login");

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#fbf8ff" }}>
      <Sidebar profile={profile as Profile} email={user.email ?? ""} />
      <Box
        component="main"
        sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}
      >
        {children}
      </Box>
    </Box>
  );
}
