"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import Divider from "@mui/material/Divider";
import { createClient } from "@/lib/supabase/client";
import BrokerAvatar from "@/components/BrokerAvatar";
import type { Profile } from "@/lib/types";

export const SIDEBAR_WIDTH = 256;

const NAV_ITEMS = [
  { label: "Dashboard",   href: "/dashboard",   Icon: SpaceDashboardOutlinedIcon, adminOnly: false },
  { label: "Engagements", href: "/engagements", Icon: LayersOutlinedIcon,          adminOnly: false },
  { label: "Brokers",     href: "/brokers",     Icon: BadgeOutlinedIcon,           adminOnly: true  },
  { label: "Clients",     href: "/clients",     Icon: GroupOutlinedIcon,           adminOnly: true  },
];

interface Props {
  profile: Profile;
  email: string;
}

export default function Sidebar({ profile, email }: Props) {
  const pathname = usePathname();
  const router   = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const items = NAV_ITEMS.filter(
    (item) => !item.adminOnly || profile.role === "admin"
  );

  return (
    <Box
      component="aside"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        bgcolor: "#ffffff",
        borderRight: "1px solid #e1e1ef",
        overflowY: "auto",
      }}
    >
      {/* ── Wordmark ── */}
      <Box sx={{ px: 3, pt: 4, pb: 3 }}>
        <Typography
          sx={{
            fontFamily: "'Newsreader14', Georgia, serif",
            fontWeight: 500,
            fontSize: 17,
            letterSpacing: "-0.01em",
            color: "#191b25",
            userSelect: "none",
          }}
        >
          ReBrokerForce
        </Typography>
      </Box>

      {/* ── Nav items ── */}
      <Box component="nav" sx={{ flex: 1, px: 1.5, pb: 2 }}>
        {items.map(({ label, href, Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === href || pathname.startsWith(href + "/");

          return (
            <Link key={href} href={href} style={{ textDecoration: "none" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 1.5,
                  py: 1.125,
                  borderRadius: 1.5,
                  mb: 0.25,
                  bgcolor: isActive ? "#ededfb" : "transparent",
                  color: isActive ? "#0052ff" : "#434656",
                  transition: "background 120ms ease, color 120ms ease",
                  "&:hover": {
                    bgcolor: isActive ? "#ededfb" : "#f3f2ff",
                    color: isActive ? "#0052ff" : "#191b25",
                  },
                }}
              >
                <Icon sx={{ fontSize: 20, flexShrink: 0 }} />
                <Typography
                  variant="body2"
                  sx={{ fontWeight: isActive ? 600 : 500, lineHeight: 1 }}
                >
                  {label}
                </Typography>
              </Box>
            </Link>
          );
        })}
      </Box>

      {/* ── Profile link ── */}
      <Box sx={{ px: 1.5, pb: 1 }}>
        {(() => {
          const isActive = pathname === "/profile";
          return (
            <Link href="/profile" style={{ textDecoration: "none" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 1.5,
                  py: 1.125,
                  borderRadius: 1.5,
                  bgcolor: isActive ? "#ededfb" : "transparent",
                  color: isActive ? "#0052ff" : "#434656",
                  transition: "background 120ms ease, color 120ms ease",
                  "&:hover": {
                    bgcolor: isActive ? "#ededfb" : "#f3f2ff",
                    color: isActive ? "#0052ff" : "#191b25",
                  },
                }}
              >
                <AccountCircleOutlinedIcon sx={{ fontSize: 20, flexShrink: 0 }} />
                <Typography
                  variant="body2"
                  sx={{ fontWeight: isActive ? 600 : 500, lineHeight: 1 }}
                >
                  Profile
                </Typography>
              </Box>
            </Link>
          );
        })()}
      </Box>

      <Divider />

      {/* ── User card ── */}
      <Box
        sx={{
          px: 2,
          py: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <BrokerAvatar
          fullName={profile.full_name}
          avatarUrl={profile.avatar_url}
          size={36}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: "#191b25",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {profile.full_name ?? "User"}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "#737688",
              display: "block",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {email}
          </Typography>
        </Box>
        <Tooltip title="Sign out">
          <IconButton
            size="small"
            onClick={handleLogout}
            sx={{ color: "#737688", flexShrink: 0, "&:hover": { color: "#191b25" } }}
          >
            <LogoutOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
