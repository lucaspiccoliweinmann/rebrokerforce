"use client";

import { useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import type { License } from "@/lib/types";

// ── Constants ──────────────────────────────────────────────────────────────────

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming", "Washington D.C.",
];

export const DOCUMENTS = [
  "Articles of Incorporation",
  "Bank Account Information",
  "Business Physical Address in the state",
  "Company Operating Agreement",
  "Company Website",
  "Employer Identification Number",
  "Errors & Omissions (E&O) Insurance",
  "Good Standing Certificate",
  "Resolution appointing Broker as Vice-president of Broker Operations / Broker/Manager",
  "Secretary of State Entity Registration",
  "SOW Agreement",
  "Trade Name Registration",
];

// ── Props ──────────────────────────────────────────────────────────────────────

interface Props {
  licenses: License[];
  onChange: (licenses: License[]) => void;
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function LicensesSection({ licenses, onChange }: Props) {
  const [expanded, setExpanded] = useState<string | false>(false);

  const addedStates = licenses.map((l) => l.state);
  const availableStates = US_STATES.filter((s) => !addedStates.includes(s));

  function addState(state: string | null) {
    if (!state) return;
    const next = [...licenses, { state, documents: [...DOCUMENTS] }];
    onChange(next);
    setExpanded(state);
  }

  function removeState(state: string) {
    onChange(licenses.filter((l) => l.state !== state));
    if (expanded === state) setExpanded(false);
  }

  function toggleDocument(state: string, doc: string, checked: boolean) {
    onChange(
      licenses.map((l) =>
        l.state !== state
          ? l
          : {
              ...l,
              documents: checked
                ? [...l.documents, doc]
                : l.documents.filter((d) => d !== doc),
            }
      )
    );
  }

  function toggleAll(state: string, checked: boolean) {
    onChange(
      licenses.map((l) =>
        l.state !== state ? l : { ...l, documents: checked ? [...DOCUMENTS] : [] }
      )
    );
  }

  return (
    <Box>
      <Typography
        variant="caption"
        sx={{
          color: "#737688",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          display: "block",
          mb: 1.5,
        }}
      >
        States &amp; Licenses
      </Typography>

      {/* State search */}
      <Autocomplete
        options={availableStates}
        value={null}
        onChange={(_, v) => addState(v)}
        blurOnSelect
        clearOnBlur
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search for a state to add it"
            size="small"
            slotProps={{
              ...params.slotProps,
              input: {
                ...params.slotProps.input,
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: "#9899aa" }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        )}
      />

      {/* State accordions */}
      {licenses.length > 0 && (
        <Box sx={{ mt: 2, border: "1px solid #e1e1ef", borderRadius: 2, overflow: "hidden" }}>
          {licenses.map((license, idx) => {
            const allChecked = DOCUMENTS.every((d) => license.documents.includes(d));
            const someChecked = license.documents.length > 0 && !allChecked;

            return (
              <Accordion
                key={license.state}
                expanded={expanded === license.state}
                onChange={(_, isExpanded) =>
                  setExpanded(isExpanded ? license.state : false)
                }
                disableGutters
                elevation={0}
                sx={{
                  borderBottom: idx < licenses.length - 1 ? "1px solid #e1e1ef" : "none",
                  "&::before": { display: "none" },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ fontSize: 18, color: "#737688" }} />}
                  sx={{
                    px: 2,
                    py: 0.5,
                    minHeight: 48,
                    bgcolor: expanded === license.state ? "#fafafe" : "#fff",
                    "& .MuiAccordionSummary-content": { alignItems: "center", gap: 1 },
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>
                    {license.state}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#737688", mr: 1 }}>
                    {license.documents.length}/{DOCUMENTS.length} docs
                  </Typography>
                  <Tooltip title="Remove state">
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); removeState(license.state); }}
                      sx={{ color: "#9899aa", "&:hover": { color: "#e05252" } }}
                    >
                      <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </AccordionSummary>

                <AccordionDetails sx={{ px: 2.5, pb: 2.5, pt: 1 }}>
                  <Typography variant="caption" sx={{ color: "#737688", display: "block", mb: 1.5 }}>
                    Select the required documents for this state
                  </Typography>

                  {/* Select all */}
                  <FormControlLabel
                    label={
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Select all
                      </Typography>
                    }
                    control={
                      <Checkbox
                        checked={allChecked}
                        indeterminate={someChecked}
                        onChange={(e) => toggleAll(license.state, e.target.checked)}
                        size="small"
                        sx={{ color: "#0052ff", "&.Mui-checked": { color: "#0052ff" }, "&.MuiCheckbox-indeterminate": { color: "#0052ff" } }}
                      />
                    }
                    sx={{ mb: 1 }}
                  />

                  <Divider sx={{ mb: 1.5 }} />

                  {/* Document grid */}
                  <Grid container spacing={0}>
                    {DOCUMENTS.map((doc) => (
                      <Grid key={doc} size={{ xs: 12, sm: 6 }}>
                        <FormControlLabel
                          label={
                            <Typography variant="body2">{doc}</Typography>
                          }
                          control={
                            <Checkbox
                              checked={license.documents.includes(doc)}
                              onChange={(e) => toggleDocument(license.state, doc, e.target.checked)}
                              size="small"
                              sx={{ color: "#9899aa", "&.Mui-checked": { color: "#0052ff" } }}
                            />
                          }
                          sx={{ mb: 0.25, alignItems: "flex-start", "& .MuiCheckbox-root": { pt: 0.5 } }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      )}

      {licenses.length === 0 && (
        <Typography variant="body2" sx={{ color: "#9899aa", mt: 1.5, fontStyle: "italic" }}>
          No states added yet. Search above to add a state license.
        </Typography>
      )}
    </Box>
  );
}
