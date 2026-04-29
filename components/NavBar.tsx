"use client";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

interface NavBarProps {
  profile: Profile;
}

const roleStyles: Record<string, { bg: string; color: string }> = {
  admin:  { bg: "#0052ff", color: "#ffffff" },
  broker: { bg: "#ff8000", color: "#ffffff" },
  buyer:  { bg: "#ededfb", color: "#191b25" },
};

export default function NavBar({ profile }: NavBarProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const rs = roleStyles[profile.role] ?? roleStyles.buyer;

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar sx={{ maxWidth: 1200, width: "100%", mx: "auto", px: { xs: 2, sm: 3 } }}>
        {/* Wordmark */}
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontFamily: "'Newsreader14', Georgia, serif",
            fontWeight: 500,
            fontSize: 18,
            letterSpacing: "-0.01em",
            color: "#191b25",
          }}
        >
          ReBrokerForce
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Name */}
          <Typography
            variant="body2"
            sx={{ color: "#434656", display: { xs: "none", sm: "block" } }}
          >
            {profile.full_name ?? profile.id}
          </Typography>

          {/* Role chip */}
          <Chip
            label={profile.role}
            size="small"
            sx={{
              bgcolor: rs.bg,
              color: rs.color,
              fontWeight: 600,
              fontSize: 11,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              height: 24,
              borderRadius: "9999px",
            }}
          />

          {/* Logout */}
          <Button
            variant="outlined"
            size="small"
            onClick={handleLogout}
            sx={{
              borderColor: "#c3c5d9",
              color: "#434656",
              fontWeight: 600,
              fontSize: 12,
              letterSpacing: "0.05em",
              px: 2,
              py: 0.5,
              "&:hover": { borderColor: "#737688", background: "#f3f2ff" },
            }}
          >
            Sign out
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
