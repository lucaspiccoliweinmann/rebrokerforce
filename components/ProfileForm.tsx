"use client";

import { useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { updateProfile, updateProfileAvatar } from "@/app/(app)/profile/actions";
import BrokerAvatar from "@/components/BrokerAvatar";
import type { Profile } from "@/lib/types";

interface Props {
  profile: Profile;
  email: string;
}

export default function ProfileForm({ profile, email }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [emailVal, setEmailVal] = useState(email);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url ?? null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function uploadAvatar(file: File): Promise<string | null> {
    const body = new FormData();
    body.append("file", file);
    body.append("profileId", profile.id);

    const res  = await fetch("/api/profiles/avatar", { method: "POST", body });
    const json = await res.json();

    if (!res.ok || json.error) {
      setError(`Avatar upload failed: ${json.error ?? res.statusText}`);
      return null;
    }
    return json.publicUrl as string;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    // Upload avatar first if a new file was chosen
    if (avatarFile) {
      const publicUrl = await uploadAvatar(avatarFile);
      if (!publicUrl) { setLoading(false); return; }
      const avatarResult = await updateProfileAvatar(publicUrl);
      if (avatarResult?.error) { setError(avatarResult.error); setLoading(false); return; }
    }

    const result = await updateProfile({
      fullName,
      email: emailVal || undefined,
    });

    setLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setAvatarFile(null);
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {error   && <Alert severity="error"   sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>Profile updated.</Alert>}

      <Stack spacing={3}>
        {/* Avatar */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, pb: 1 }}>
          <Box sx={{ position: "relative" }}>
            <BrokerAvatar fullName={fullName || null} avatarUrl={avatarPreview} size={88} />
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
          value={emailVal}
          onChange={(e) => setEmailVal(e.target.value)}
          fullWidth
        />

        <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 1 }}>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Saving…" : "Save changes"}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
