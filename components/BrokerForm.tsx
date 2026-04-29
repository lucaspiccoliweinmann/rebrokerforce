"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import {
  createBroker,
  updateBroker,
  updateBrokerAvatar,
  deleteBroker,
} from "@/app/(app)/brokers/actions";
import BrokerAvatar from "@/components/BrokerAvatar";
import type { Profile } from "@/lib/types";

interface Props {
  broker?: Profile & { email?: string };
}

export default function BrokerForm({ broker }: Props) {
  const router = useRouter();
  const isEdit = !!broker;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(broker?.full_name ?? "");
  const [email, setEmail] = useState(broker?.email ?? "");
  const [password, setPassword] = useState("");

  // Avatar state: preview shown in UI, file held for upload
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    broker?.avatar_url ?? null
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ── File picker ─────────────────────────────────────────────────────────────

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  // ── Upload helper (via server-side API route → admin client) ─────────────────

  async function uploadAvatar(brokerId: string, file: File): Promise<string | null> {
    const body = new FormData();
    body.append("file", file);
    body.append("profileId", brokerId);

    const res = await fetch("/api/profiles/avatar", { method: "POST", body });
    const json = await res.json();

    if (!res.ok || json.error) {
      setError(`Avatar upload failed: ${json.error ?? res.statusText}`);
      return null;
    }

    return json.publicUrl as string;
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (isEdit) {
      // 1. Update name / email
      const result = await updateBroker(broker!.id, {
        fullName,
        email: email || undefined,
      });
      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // 2. Upload avatar if a new file was picked
      if (avatarFile) {
        const publicUrl = await uploadAvatar(broker!.id, avatarFile);
        if (!publicUrl) { setLoading(false); return; }
        const avatarResult = await updateBrokerAvatar(broker!.id, publicUrl);
        if (avatarResult?.error) {
          setError(avatarResult.error);
          setLoading(false);
          return;
        }
      }
    } else {
      // 1. Create broker → get new ID
      const result = await createBroker({ fullName, email, password });
      if (result?.error || !result?.id) {
        setError(result?.error ?? "Failed to create broker.");
        setLoading(false);
        return;
      }

      // 2. Upload avatar if selected
      if (avatarFile) {
        const publicUrl = await uploadAvatar(result.id, avatarFile);
        if (!publicUrl) { setLoading(false); return; }
        await updateBrokerAvatar(result.id, publicUrl);
      }
    }

    router.push("/brokers");
    router.refresh();
  }

  // ── Delete ──────────────────────────────────────────────────────────────────

  async function handleDelete() {
    if (!broker) return;
    if (
      !confirm(
        `Delete ${broker.full_name ?? broker.id}? This cannot be undone.`
      )
    )
      return;
    setLoading(true);
    const result = await deleteBroker(broker.id);
    setLoading(false);
    if (result?.error) setError(result.error);
    // On success, deleteBroker redirects server-side
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* Avatar picker */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, pb: 1 }}>
          <Box sx={{ position: "relative" }}>
            <BrokerAvatar
              fullName={fullName || null}
              avatarUrl={avatarPreview}
              size={88}
            />
            <Tooltip title="Upload photo">
              <IconButton
                size="small"
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  position: "absolute",
                  bottom: -4,
                  right: -4,
                  bgcolor: "#ffffff",
                  border: "1px solid #e1e1ef",
                  width: 28,
                  height: 28,
                  "&:hover": { bgcolor: "#f3f2ff" },
                }}
              >
                <CameraAltIcon sx={{ fontSize: 14, color: "#434656" }} />
              </IconButton>
            </Tooltip>
          </Box>
          <Typography variant="caption" sx={{ color: "#737688" }}>
            {avatarFile ? avatarFile.name : "JPG, PNG or WebP · max 5 MB"}
          </Typography>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </Box>

        {/* Fields */}
        <TextField
          label="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          fullWidth
        />

        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required={!isEdit}
          fullWidth
          helperText={isEdit ? "Leave blank to keep existing email." : undefined}
        />

        {!isEdit && (
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            helperText="At least 6 characters."
            slotProps={{ htmlInput: { minLength: 6 } }}
          />
        )}

        {/* Actions */}
        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", pt: 1 }}>
          {isEdit && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleDelete}
              disabled={loading}
              sx={{ mr: "auto" }}
            >
              Delete broker
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Saving…" : isEdit ? "Save changes" : "Create broker"}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
