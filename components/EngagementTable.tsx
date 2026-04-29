"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import EditIcon from "@mui/icons-material/Edit";
import Link from "next/link";
import BrokerAvatar from "@/components/BrokerAvatar";
import type { Engagement, EngagementStatus } from "@/lib/types";

const STATUS_COLOR: Record<EngagementStatus, { bg: string; text: string; dot: string }> = {
  pending: { bg: "#fff8ed", text: "#b45309", dot: "#f59e0b" },
  active:  { bg: "#ecfdf5", text: "#065f46", dot: "#10b981" },
  closed:  { bg: "#f3f4f6", text: "#4b5563", dot: "#9ca3af" },
};

interface Props {
  engagements: Engagement[];
  isAdmin: boolean;
}

function PersonCell({ fullName, avatarUrl }: { fullName: string | null; avatarUrl: string | null }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <BrokerAvatar fullName={fullName} avatarUrl={avatarUrl} size={32} />
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {fullName ?? "—"}
      </Typography>
    </Box>
  );
}

export default function EngagementTable({ engagements, isAdmin }: Props) {
  return (
    <TableContainer sx={{ border: "1px solid #e1e1ef", borderRadius: 2, overflow: "hidden" }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: "#fafafe" }}>
            <TableCell sx={{ fontWeight: 700, color: "#737688", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Name
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: "#737688", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Client
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: "#737688", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Broker
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: "#737688", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Status
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: "#737688", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Files
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: "#737688", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Created
            </TableCell>
            {isAdmin && <TableCell />}
          </TableRow>
        </TableHead>
        <TableBody>
          {engagements.length === 0 && (
            <TableRow>
              <TableCell colSpan={isAdmin ? 7 : 6} align="center" sx={{ py: 6, color: "#737688" }}>
                No engagements yet.
              </TableCell>
            </TableRow>
          )}
          {engagements.map((e) => {
            const colors = STATUS_COLOR[e.status];
            const fileCount = e.files?.length ?? 0;
            return (
              <TableRow
                key={e.id}
                hover
                sx={{ "&:last-child td": { borderBottom: 0 } }}
              >
                {/* Name */}
                <TableCell>
                  {e.name ? (
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#191b25" }}>
                      {e.name}
                    </Typography>
                  ) : (
                    <Typography variant="body2" sx={{ color: "#9899aa", fontStyle: "italic" }}>
                      Untitled
                    </Typography>
                  )}
                </TableCell>

                {/* Client */}
                <TableCell>
                  <PersonCell
                    fullName={e.buyer?.full_name ?? null}
                    avatarUrl={e.buyer?.avatar_url ?? null}
                  />
                </TableCell>

                {/* Broker */}
                <TableCell>
                  {e.broker ? (
                    <PersonCell
                      fullName={e.broker.full_name ?? null}
                      avatarUrl={e.broker.avatar_url ?? null}
                    />
                  ) : (
                    <Typography variant="body2" sx={{ color: "#9899aa" }}>—</Typography>
                  )}
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.75,
                      px: 1.25,
                      py: 0.4,
                      borderRadius: 99,
                      bgcolor: colors.bg,
                    }}
                  >
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: colors.dot, flexShrink: 0 }} />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: colors.text, textTransform: "capitalize" }}>
                      {e.status}
                    </Typography>
                  </Box>
                </TableCell>

                {/* Files */}
                <TableCell>
                  {fileCount > 0 ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <AttachFileIcon sx={{ fontSize: 15, color: "#737688" }} />
                      <Typography variant="body2" sx={{ color: "#737688" }}>{fileCount}</Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ color: "#c8c9d8" }}>—</Typography>
                  )}
                </TableCell>

                {/* Created */}
                <TableCell>
                  <Typography variant="body2" sx={{ color: "#737688" }}>
                    {new Date(e.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </Typography>
                </TableCell>

                {/* Actions */}
                {isAdmin && (
                  <TableCell align="right">
                    <Tooltip title="Edit engagement">
                      <IconButton component={Link} href={`/engagements/${e.id}`} size="small" sx={{ color: "#737688", "&:hover": { color: "#0052ff" } }}>
                        <EditIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
