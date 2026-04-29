import Avatar from "@mui/material/Avatar";

interface Props {
  fullName: string | null;
  avatarUrl: string | null | undefined;
  size?: number;
}

/** Returns up to two initials from a full name. */
function initials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Shows the broker's avatar photo, or their initials on a tonal background
 * if no photo is available.
 */
export default function BrokerAvatar({ fullName, avatarUrl, size = 40 }: Props) {
  return (
    <Avatar
      src={avatarUrl ?? undefined}
      alt={fullName ?? "Broker"}
      sx={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        fontWeight: 600,
        fontFamily: "'Inter', system-ui, sans-serif",
        bgcolor: "#ededfb",
        color: "#0052ff",
        border: "1px solid #e1e1ef",
        letterSpacing: "0.02em",
      }}
    >
      {initials(fullName)}
    </Avatar>
  );
}
