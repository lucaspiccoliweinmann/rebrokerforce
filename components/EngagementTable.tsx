"use client";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import Link from "next/link";
import type { Engagement, EngagementStatus } from "@/lib/types";

const statusColor: Record<EngagementStatus, "default" | "success" | "error" | "warning"> = {
  pending: "warning",
  active: "success",
  closed: "default",
};

interface Props {
  engagements: Engagement[];
  isAdmin: boolean;
}

export default function EngagementTable({ engagements, isAdmin }: Props) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Buyer</TableCell>
            <TableCell>Broker</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Notes</TableCell>
            <TableCell>Created</TableCell>
            {isAdmin && <TableCell align="right">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {engagements.length === 0 && (
            <TableRow>
              <TableCell colSpan={isAdmin ? 6 : 5} align="center" sx={{ color: "text.secondary" }}>
                No engagements found.
              </TableCell>
            </TableRow>
          )}
          {engagements.map((e) => (
            <TableRow key={e.id} hover>
              <TableCell>{e.buyer?.full_name ?? e.buyer_id}</TableCell>
              <TableCell>{e.broker?.full_name ?? e.broker_id}</TableCell>
              <TableCell>
                <Chip label={e.status} color={statusColor[e.status]} size="small" />
              </TableCell>
              <TableCell sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {e.notes ?? "—"}
              </TableCell>
              <TableCell>{new Date(e.created_at).toLocaleDateString()}</TableCell>
              {isAdmin && (
                <TableCell align="right">
                  <IconButton component={Link} href={`/engagements/${e.id}`} size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
