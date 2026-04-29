"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary:   { main: "#0052ff", dark: "#003ec7", contrastText: "#ffffff" },
    secondary: { main: "#ff8000", contrastText: "#ffffff" },
    error:     { main: "#ba1a1a" },
    background: { default: "#fbf8ff", paper: "#ffffff" },
    text: {
      primary:   "#191b25",
      secondary: "#434656",
      disabled:  "#737688",
    },
    divider: "#c3c5d9",
  },
  typography: {
    fontFamily: "'Inter', system-ui, sans-serif",
    h1: { fontFamily: "'Newsreader60', Georgia, serif", fontSize: 48, fontWeight: 500, lineHeight: 1.1, letterSpacing: "-0.02em" },
    h2: { fontFamily: "'Newsreader36', Georgia, serif", fontSize: 36, fontWeight: 500, lineHeight: 1.2, letterSpacing: "-0.01em" },
    h3: { fontFamily: "'Newsreader24', Georgia, serif", fontSize: 24, fontWeight: 500, lineHeight: 1.3 },
    h4: { fontFamily: "'Newsreader24', Georgia, serif", fontSize: 20, fontWeight: 500, lineHeight: 1.3 },
    h5: { fontFamily: "'Newsreader14', Georgia, serif", fontSize: 18, fontWeight: 500, lineHeight: 1.4 },
    h6: { fontFamily: "'Newsreader14', Georgia, serif", fontSize: 16, fontWeight: 500, lineHeight: 1.4 },
    body1: { fontFamily: "'Inter', system-ui, sans-serif", fontSize: 16, lineHeight: 1.5 },
    body2: { fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14, lineHeight: 1.5 },
    button: { fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" },
    caption: { fontFamily: "'Inter', system-ui, sans-serif", fontSize: 12 },
  },
  shape: { borderRadius: 8 },
  shadows: [
    "none",
    "0 4px 20px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.06)",
    "0 8px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)",
    ...Array(22).fill("none") as string[],
  ] as any,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "uppercase",
          fontWeight: 600,
          letterSpacing: "0.05em",
          fontSize: 14,
          padding: "10px 24px",
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
          "&:active": { transform: "scale(0.98)" },
          "&.MuiButton-containedPrimary": {
            background: "#0052ff",
            "&:hover": { background: "#003ec7" },
          },
          "&.MuiButton-outlinedPrimary": {
            borderColor: "#191b25",
            color: "#191b25",
            "&:hover": { background: "#f3f2ff", borderColor: "#191b25" },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: "#ffffff",
          border: "1px solid #e1e1ef",
          borderRadius: 8,
          boxShadow: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
        elevation1: { boxShadow: "0 4px 20px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.06)" },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            "& fieldset": { borderColor: "#e1e1ef" },
            "&:hover fieldset": { borderColor: "#737688" },
            "&.Mui-focused fieldset": { borderColor: "#0052ff" },
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-root": {
            fontWeight: 600,
            fontSize: 12,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "#737688",
            borderBottom: "1px solid #e1e1ef",
            background: "#fbf8ff",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: "1px solid #f3f2ff", padding: "14px 16px" },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 9999, fontWeight: 500, fontSize: 12 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "#ffffff",
          color: "#191b25",
          boxShadow: "none",
          borderBottom: "1px solid #e1e1ef",
        },
      },
    },
  },
});

export default theme;
