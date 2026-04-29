"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import { createClient } from "@/lib/supabase/client";
import type { Engagement, EngagementStatus, Profile } from "@/lib/types";

interface Props {
  buyers: Profile[];
  brokers: Profile[];
  engagement?: Engagement;
}

const STATUSES: EngagementStatus[] = ["pending", "active", "closed"];

export default function EngagementForm({ buyers, brokers, engagement }: Props) {
  const router = useRouter();
  const isEdit = !!engagement;

  const [buyerId, setBuyerId] = useState(engagement?.buyer_id ?? "");
  const [brokerId, setBrokerId] = useState(engagement?.broker_id ?? "");
  const [status, setStatus] = useState<EngagementStatus>(engagement?.status ?? "pending");
  const [notes, setNotes] = useState(engagement?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();

    const payload = {
      buyer_id: buyerId,
      broker_id: brokerId,
      status,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    };

    const { error: dbError } = isEdit
      ? await supabase.from("engagements").update(payload).eq("id", engagement!.id)
      : await supabase.from("engagements").insert(payload);

    setLoading(false);
    if (dbError) {
      setError(dbError.message);
    } else {
      router.push("/engagements");
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!engagement) return;
    setLoading(true);
    const supabase = createClient();
    const { error: dbError } = await supabase
      .from("engagements")
      .delete()
      .eq("id", engagement.id);
    setLoading(false);
    if (dbError) {
      setError(dbError.message);
    } else {
      router.push("/engagements");
      router.refresh();
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Stack spacing={3}>
        <TextField
          select
          label="Buyer"
          value={buyerId}
          onChange={(e) => setBuyerId(e.target.value)}
          required
          fullWidth
        >
          {buyers.map((b) => (
            <MenuItem key={b.id} value={b.id}>
              {b.full_name ?? b.id}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Broker"
          value={brokerId}
          onChange={(e) => setBrokerId(e.target.value)}
          required
          fullWidth
        >
          {brokers.map((b) => (
            <MenuItem key={b.id} value={b.id}>
              {b.full_name ?? b.id}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as EngagementStatus)}
          fullWidth
        >
          {STATUSES.map((s) => (
            <MenuItem key={s} value={s} sx={{ textTransform: "capitalize" }}>
              {s}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Notes"
          multiline
          rows={3}
          fullWidth
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          {isEdit && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleDelete}
              disabled={loading}
            >
              Delete
            </Button>
          )}
          <Button variant="outlined" onClick={() => router.back()} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Saving…" : isEdit ? "Save changes" : "Create engagement"}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
