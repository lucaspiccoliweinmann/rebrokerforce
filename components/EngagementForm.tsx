"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { createClient } from "@/lib/supabase/client";
import BrokerAvatar from "@/components/BrokerAvatar";
import type { Engagement, EngagementFile, EngagementStatus, Profile } from "@/lib/types";

interface Props {
  buyers: Profile[];
  brokers: Profile[];
  engagement?: Engagement;
}

const STATUSES: { value: EngagementStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "active",  label: "Active"  },
  { value: "closed",  label: "Closed"  },
];

const STATUS_COLORS: Record<EngagementStatus, string> = {
  pending: "#f59e0b",
  active:  "#10b981",
  closed:  "#6b7280",
};

function formatBytes(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(mime: string | null) {
  return <AttachFileIcon sx={{ fontSize: 18, color: "#737688" }} />;
}

export default function EngagementForm({ buyers, brokers, engagement }: Props) {
  const router = useRouter();
  const isEdit = !!engagement;
  const dropRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Form state ────────────────────────────────────────────────────────────
  const [name, setName] = useState(engagement?.name ?? "");
  const [buyer, setBuyer] = useState<Profile | null>(
    buyers.find((b) => b.id === engagement?.buyer_id) ?? null
  );
  const [broker, setBroker] = useState<Profile | null>(
    brokers.find((b) => b.id === engagement?.broker_id) ?? null
  );
  const [status, setStatus] = useState<EngagementStatus>(engagement?.status ?? "pending");
  const [clientNotes, setClientNotes]     = useState(engagement?.client_notes ?? "");
  const [complianceNotes, setComplianceNotes] = useState(engagement?.compliance_notes ?? "");
  const [emailNotes, setEmailNotes]       = useState(engagement?.email_notes ?? "");

  // ── File state ────────────────────────────────────────────────────────────
  const [existingFiles, setExistingFiles] = useState<EngagementFile[]>(engagement?.files ?? []);
  const [pendingFiles,  setPendingFiles]  = useState<File[]>([]);
  const [dragOver,      setDragOver]      = useState(false);
  const [uploadingIdx,  setUploadingIdx]  = useState<number | null>(null);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [error,   setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ── File helpers ──────────────────────────────────────────────────────────
  function addFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    setPendingFiles((prev) => [...prev, ...arr]);
  }

  function removePending(idx: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function deleteExisting(file: EngagementFile) {
    const res = await fetch(`/api/engagements/files/${file.id}`, { method: "DELETE" });
    if (res.ok) {
      setExistingFiles((prev) => prev.filter((f) => f.id !== file.id));
    } else {
      const json = await res.json();
      setError(`Could not delete file: ${json.error ?? res.statusText}`);
    }
  }

  async function uploadPendingFiles(engagementId: string) {
    for (let i = 0; i < pendingFiles.length; i++) {
      setUploadingIdx(i);
      const body = new FormData();
      body.append("file", pendingFiles[i]);
      body.append("engagementId", engagementId);
      const res = await fetch("/api/engagements/files", { method: "POST", body });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(`Upload failed for "${pendingFiles[i].name}": ${json.error}`);
      }
    }
    setUploadingIdx(null);
    setPendingFiles([]);
  }

  // ── Drag-and-drop ─────────────────────────────────────────────────────────
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => setDragOver(false), []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }, []);

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!buyer) { setError("Please select a client."); return; }
    setError(null);
    setLoading(true);

    const supabase = createClient();

    const payload = {
      buyer_id:          buyer.id,
      broker_id:         broker?.id ?? null,
      status,
      name:              name.trim() || null,
      client_notes:      clientNotes.trim() || null,
      compliance_notes:  complianceNotes.trim() || null,
      email_notes:       emailNotes.trim() || null,
      updated_at:        new Date().toISOString(),
    };

    let engagementId = engagement?.id;

    if (isEdit) {
      const { error: dbError } = await supabase
        .from("engagements")
        .update(payload)
        .eq("id", engagementId!);
      if (dbError) { setError(dbError.message); setLoading(false); return; }
    } else {
      const { data, error: dbError } = await supabase
        .from("engagements")
        .insert(payload)
        .select("id")
        .single();
      if (dbError || !data) { setError(dbError?.message ?? "Unknown error"); setLoading(false); return; }
      engagementId = data.id;
    }

    // Upload any pending files
    if (pendingFiles.length > 0) {
      try {
        await uploadPendingFiles(engagementId!);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    router.push("/engagements");
    router.refresh();
  }

  // ── Delete engagement ─────────────────────────────────────────────────────
  async function handleDelete() {
    if (!engagement) return;
    if (!confirm("Delete this engagement? This cannot be undone.")) return;
    setLoading(true);
    const supabase = createClient();
    const { error: dbError } = await supabase
      .from("engagements")
      .delete()
      .eq("id", engagement.id);
    setLoading(false);
    if (dbError) { setError(dbError.message); return; }
    router.push("/engagements");
    router.refresh();
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={4}>
        {/* ── LEFT COLUMN ── */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={3}>

            {/* Engagement name */}
            <Box>
              <Typography variant="caption" sx={{ color: "#737688", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", mb: 0.5 }}>
                Engagement name
              </Typography>
              <InputBase
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Engagement #1"
                sx={{
                  fontSize: "1.5rem",
                  fontFamily: "Newsreader, serif",
                  fontWeight: 600,
                  color: "#191b25",
                  width: "100%",
                  "& input": { p: 0 },
                  "&::before": { display: "none" },
                  "&::after":  { display: "none" },
                  borderBottom: "2px solid #e1e1ef",
                  pb: 0.5,
                  "&:focus-within": { borderBottom: "2px solid #0052ff" },
                }}
              />
            </Box>

            {/* Status */}
            <TextField
              select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as EngagementStatus)}
              fullWidth
              size="small"
            >
              {STATUSES.map(({ value, label }) => (
                <MenuItem key={value} value={value}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: STATUS_COLORS[value], flexShrink: 0 }} />
                    {label}
                  </Box>
                </MenuItem>
              ))}
            </TextField>

            <Divider />

            {/* Client (buyer) */}
            <Autocomplete
              options={buyers}
              value={buyer}
              onChange={(_, v) => setBuyer(v)}
              getOptionLabel={(o) => o.full_name ?? o.id}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              renderOption={(props, option) => {
                const { key, ...rest } = props as React.HTMLAttributes<HTMLLIElement> & { key: React.Key };
                return (
                  <Box component="li" key={key} {...rest} sx={{ display: "flex", alignItems: "center", gap: 1.5, py: "8px !important" }}>
                    <BrokerAvatar fullName={option.full_name} avatarUrl={option.avatar_url} size={32} />
                    <Typography variant="body2">{option.full_name ?? option.id}</Typography>
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Client *"
                  placeholder="Search clients…"
                  size="small"
                  slotProps={{
                    ...params.slotProps,
                    input: {
                      ...params.slotProps.input,
                      startAdornment: buyer ? (
                        <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                          <BrokerAvatar fullName={buyer.full_name} avatarUrl={buyer.avatar_url} size={24} />
                        </Box>
                      ) : params.slotProps.input.startAdornment,
                    },
                  }}
                />
              )}
            />

            {/* Broker (optional) */}
            <Autocomplete
              options={brokers}
              value={broker}
              onChange={(_, v) => setBroker(v)}
              getOptionLabel={(o) => o.full_name ?? o.id}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              renderOption={(props, option) => {
                const { key, ...rest } = props as React.HTMLAttributes<HTMLLIElement> & { key: React.Key };
                return (
                  <Box component="li" key={key} {...rest} sx={{ display: "flex", alignItems: "center", gap: 1.5, py: "8px !important" }}>
                    <BrokerAvatar fullName={option.full_name} avatarUrl={option.avatar_url} size={32} />
                    <Typography variant="body2">{option.full_name ?? option.id}</Typography>
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Broker (optional)"
                  placeholder="Search brokers…"
                  size="small"
                  slotProps={{
                    ...params.slotProps,
                    input: {
                      ...params.slotProps.input,
                      startAdornment: broker ? (
                        <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                          <BrokerAvatar fullName={broker.full_name} avatarUrl={broker.avatar_url} size={24} />
                        </Box>
                      ) : params.slotProps.input.startAdornment,
                    },
                  }}
                />
              )}
            />

          </Stack>
        </Grid>

        {/* ── RIGHT COLUMN ── */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={3}>

            {/* Client notes */}
            <TextField
              label="Client notes"
              multiline
              minRows={3}
              fullWidth
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
              placeholder="Notes visible to the client…"
            />

            {/* Compliance notes */}
            <TextField
              label="Compliance notes"
              multiline
              minRows={3}
              fullWidth
              value={complianceNotes}
              onChange={(e) => setComplianceNotes(e.target.value)}
              placeholder="Internal compliance details…"
            />

            {/* Email notes */}
            <TextField
              label="Email notes"
              multiline
              minRows={3}
              fullWidth
              value={emailNotes}
              onChange={(e) => setEmailNotes(e.target.value)}
              placeholder="Notes for outgoing emails…"
            />

            {/* ── File upload ── */}
            <Box>
              <Typography variant="caption" sx={{ color: "#737688", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", mb: 1 }}>
                Files
              </Typography>

              {/* Drop zone */}
              <Box
                ref={dropRef}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  border: `2px dashed ${dragOver ? "#0052ff" : "#d0d0e8"}`,
                  borderRadius: 2,
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                  cursor: "pointer",
                  bgcolor: dragOver ? "#f0f3ff" : "#fafafe",
                  transition: "all 0.15s",
                  "&:hover": { borderColor: "#0052ff", bgcolor: "#f0f3ff" },
                }}
              >
                <UploadFileIcon sx={{ fontSize: 32, color: dragOver ? "#0052ff" : "#737688" }} />
                <Typography variant="body2" sx={{ color: "#737688", textAlign: "center" }}>
                  Drag &amp; drop files here, or <Box component="span" sx={{ color: "#0052ff", fontWeight: 600 }}>browse</Box>
                </Typography>
                <Typography variant="caption" sx={{ color: "#9899aa" }}>
                  PDF, Word, Excel, images — up to 50 MB each
                </Typography>
              </Box>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: "none" }}
                onChange={(e) => { if (e.target.files) addFiles(e.target.files); }}
              />

              {/* Existing files */}
              {existingFiles.length > 0 && (
                <Stack spacing={0.5} sx={{ mt: 2 }}>
                  {existingFiles.map((file) => (
                    <Box
                      key={file.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        px: 1.5,
                        py: 1,
                        borderRadius: 1,
                        border: "1px solid #e1e1ef",
                        bgcolor: "#fff",
                      }}
                    >
                      {fileIcon(file.mime_type)}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                          {file.file_name}
                        </Typography>
                        {file.file_size && (
                          <Typography variant="caption" sx={{ color: "#737688" }}>
                            {formatBytes(file.file_size)}
                          </Typography>
                        )}
                      </Box>
                      <Tooltip title="Download">
                        <IconButton
                          size="small"
                          component="a"
                          href={file.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ color: "#737688" }}
                        >
                          <AttachFileIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete file">
                        <IconButton
                          size="small"
                          onClick={() => deleteExisting(file)}
                          sx={{ color: "#e05252" }}
                        >
                          <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ))}
                </Stack>
              )}

              {/* Pending files (queued for upload) */}
              {pendingFiles.length > 0 && (
                <Stack spacing={0.5} sx={{ mt: existingFiles.length > 0 ? 1 : 2 }}>
                  {pendingFiles.map((file, idx) => (
                    <Box
                      key={`${file.name}-${idx}`}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        px: 1.5,
                        py: 1,
                        borderRadius: 1,
                        border: "1px dashed #a5b4fc",
                        bgcolor: "#f5f5ff",
                      }}
                    >
                      {uploadingIdx === idx ? (
                        <CircularProgress size={16} sx={{ color: "#0052ff" }} />
                      ) : (
                        fileIcon(file.type)
                      )}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                          {file.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#737688" }}>
                          {formatBytes(file.size)} · {uploadingIdx === idx ? "Uploading…" : "Ready to upload"}
                        </Typography>
                      </Box>
                      {uploadingIdx !== idx && (
                        <Tooltip title="Remove">
                          <IconButton size="small" onClick={() => removePending(idx)} sx={{ color: "#737688" }}>
                            <CloseIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

          </Stack>
        </Grid>
      </Grid>

      {/* ── Action bar ── */}
      <Divider sx={{ mt: 5, mb: 3 }} />
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          {isEdit && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleDelete}
              disabled={loading}
              startIcon={<DeleteOutlinedIcon />}
            >
              Delete engagement
            </Button>
          )}
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button variant="outlined" onClick={() => router.back()} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading
              ? uploadingIdx !== null
                ? `Uploading ${uploadingIdx + 1}/${pendingFiles.length}…`
                : "Saving…"
              : isEdit
              ? "Save changes"
              : "Create engagement"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
