"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#fbf8ff",
        px: 2,
      }}
    >
      {/* Wordmark above card */}
      <Typography
        sx={{
          fontFamily: "'Newsreader36', Georgia, serif",
          fontWeight: 500,
          fontSize: { xs: 28, sm: 36 },
          letterSpacing: "-0.02em",
          color: "#191b25",
          mb: 6,
        }}
      >
        ReBrokerForce
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, sm: 5 },
          width: "100%",
          maxWidth: 400,
          border: "1px solid #e1e1ef",
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h3"
          sx={{ mb: 1, fontSize: 22, fontWeight: 500, color: "#191b25" }}
        >
          Sign in
        </Typography>
        <Typography variant="body2" sx={{ color: "#737688", mb: 4 }}>
          Enter your credentials to access your account.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 0 }}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            required
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </Box>
      </Paper>

      {/* Footer tag */}
      <Typography variant="caption" sx={{ mt: 6, color: "#c3c5d9" }}>
        Nationwide broker licensing & compliance
      </Typography>
    </Box>
  );
}
