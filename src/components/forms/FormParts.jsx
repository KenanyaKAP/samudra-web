import { useEffect, useRef, useState } from "react";
import { Box, ButtonBase, Checkbox, InputBase, MenuItem, Select, Typography } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { block, fluid, WIDE } from "../../utils/design";
import SpaLink from "../ui/SpaLink";

/**
 * Building blocks of the two dark forms of New Design.pdf (Request a
 * Proposal, Career Application): 24 px labels with a red asterisk, 71 px
 * fields on #211D1E, dashed upload boxes, a full-width red submit button.
 */

const FIELD_BG = "brand.input";
const FIELD_BORDER = "rgba(255,255,255,0.22)";
const RADIUS = fluid(7, 5);

const fieldSx = (error) => ({
  width: "100%",
  bgcolor: FIELD_BG,
  color: "common.white",
  border: "1px solid",
  borderColor: error ? "primary.main" : FIELD_BORDER,
  borderRadius: RADIUS,
  fontSize: { xs: 16, md: fluid(18, 15) },
  transition: "border-color .2s ease",
  "&.Mui-focused, &:focus-within": { borderColor: error ? "primary.main" : "rgba(255,255,255,0.6)" },
  "& input, & textarea": { p: 0 },
  "& input::placeholder, & textarea::placeholder": { color: "brand.placeholder", opacity: 1 },
});

/** The dark panel with a thin light border that holds a form. */
export function FormPanel({ children, sx = {} }) {
  return (
    <Box
      sx={{
        ...block(WIDE),
        position: "relative",
        bgcolor: "brand.panel",
        border: "1px solid rgba(255,255,255,0.55)",
        borderRadius: fluid(22, 14),
        px: { xs: 2.5, sm: 4, md: fluid(63, 32) },
        pt: { xs: 4, md: fluid(52, 32) },
        pb: { xs: 4, md: fluid(64, 36) },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

/** Two columns on desktop, one on phones. */
export function FieldGrid({ children }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        columnGap: fluid(29, 20),
        rowGap: { xs: 3, md: fluid(30, 20) },
      }}
    >
      {children}
    </Box>
  );
}

/** Label (+ red asterisk when required), the control, and its error. */
export function Field({ id, label, required, error, children, full = false }) {
  return (
    <Box sx={{ gridColumn: full ? "1 / -1" : "auto", minWidth: 0 }}>
      <Typography
        component="label"
        htmlFor={id}
        sx={{ display: "block", color: "common.white", fontSize: { xs: 17, md: fluid(24, 16) }, lineHeight: 1.2, mb: { xs: 1.25, md: fluid(22, 10) } }}
      >
        {label}
        {required && (
          <Box component="span" aria-hidden="true" sx={{ color: "#ED1C24", ml: "0.25em", fontSize: "0.85em", verticalAlign: "super" }}>
            *
          </Box>
        )}
      </Typography>
      {children}
      {error && (
        <Typography role="alert" sx={{ color: "#FF6B70", fontSize: { xs: 14, md: fluid(16, 13) }, mt: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}

export function TextInput({ id, name, value, onChange, placeholder, type = "text", required, error, ...rest }) {
  return (
    <InputBase
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={(e) => onChange(name, e.target.value)}
      placeholder={placeholder}
      inputProps={{ "aria-required": required || undefined, "aria-invalid": !!error, ...rest }}
      sx={{ ...fieldSx(error), height: { xs: 56, md: fluid(71, 52) }, px: { xs: 2, md: fluid(27, 16) } }}
    />
  );
}

export function SelectInput({ id, name, value, onChange, placeholder, options = [], required, error }) {
  return (
    <Select
      id={id}
      name={name}
      value={value}
      displayEmpty
      onChange={(e) => onChange(name, e.target.value)}
      input={<InputBase inputProps={{ "aria-required": required || undefined, "aria-invalid": !!error }} />}
      IconComponent={KeyboardArrowDownIcon}
      renderValue={(v) =>
        v ? v : <Box component="span" sx={{ color: "brand.placeholder" }}>{placeholder}</Box>
      }
      MenuProps={{
        slotProps: {
          paper: { sx: { bgcolor: "#2A2627", color: "common.white", "& .MuiMenuItem-root:hover": { bgcolor: "rgba(255,255,255,0.08)" } } },
        },
      }}
      sx={{
        ...fieldSx(error),
        height: { xs: 56, md: fluid(71, 52) },
        "& .MuiSelect-select": { px: { xs: 2, md: fluid(27, 16) }, display: "flex", alignItems: "center", height: "100% !important", boxSizing: "border-box" },
        "& .MuiSelect-icon": { color: "common.white", right: { xs: 12, md: fluid(26, 12) }, fontSize: { xs: 26, md: fluid(30, 24) } },
      }}
    >
      {options.map((opt) => (
        <MenuItem key={opt} value={opt}>
          {opt}
        </MenuItem>
      ))}
    </Select>
  );
}

export function TextArea({ id, name, value, onChange, placeholder, maxLength, required, error }) {
  return (
    <Box sx={{ position: "relative" }}>
      <InputBase
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        multiline
        minRows={4}
        inputProps={{ maxLength, "aria-required": required || undefined, "aria-invalid": !!error }}
        sx={{
          ...fieldSx(error),
          minHeight: { xs: 160, md: fluid(181, 140) },
          alignItems: "flex-start",
          px: { xs: 2, md: fluid(27, 16) },
          pt: { xs: 2, md: fluid(26, 14) },
          pb: { xs: 5, md: fluid(48, 36) },
        }}
      />
      <Typography
        aria-hidden="true"
        sx={{ position: "absolute", right: { xs: 14, md: fluid(22, 14) }, bottom: { xs: 12, md: fluid(16, 10) }, color: "brand.placeholder", fontSize: { xs: 14, md: fluid(18, 13) } }}
      >
        {value.length}/{maxLength}
      </Typography>
    </Box>
  );
}

const MB = 1024 * 1024;

/**
 * Dashed "Click to upload files or drag and drop" box. Validates type and
 * size on the way in; the server checks again.
 */
export function FileDropzone({ id, files, onChange, multiple = false, maxFiles = 1, accept, maxSize = 10 * MB, title, hint, formats, error }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState("");
  const exts = accept.split(",").map((e) => e.trim().toLowerCase());

  const add = (list) => {
    const incoming = Array.from(list || []);
    const bad = incoming.find((f) => !exts.some((e) => f.name.toLowerCase().endsWith(e)));
    const big = incoming.find((f) => f.size > maxSize);
    if (bad) return setLocalError(`"${bad.name}" is not an accepted file type.`);
    if (big) return setLocalError(`"${big.name}" is larger than ${Math.round(maxSize / MB)} MB.`);
    const next = multiple ? [...files, ...incoming].slice(0, maxFiles) : incoming.slice(0, 1);
    if (multiple && files.length + incoming.length > maxFiles) {
      setLocalError(`You can attach up to ${maxFiles} files.`);
    } else {
      setLocalError("");
    }
    onChange(next);
  };

  const remove = (i) => onChange(files.filter((_, j) => j !== i));
  const message = localError || error;

  return (
    <Box>
      <ButtonBase
        component="div"
        role="button"
        tabIndex={0}
        aria-describedby={`${id}-hint`}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          add(e.dataTransfer.files);
        }}
        sx={{
          width: "100%",
          minHeight: { xs: 150, md: fluid(181, 140) },
          flexDirection: "column",
          gap: 0.5,
          border: "1.5px dashed",
          borderColor: message ? "primary.main" : dragging ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.35)",
          borderRadius: RADIUS,
          bgcolor: dragging ? "rgba(255,255,255,0.04)" : "transparent",
          color: "common.white",
          textAlign: "center",
          px: 2,
          py: 3,
        }}
      >
        <CloudUploadOutlinedIcon sx={{ fontSize: { xs: 36, md: fluid(44, 34) }, mb: 1 }} />
        <Typography sx={{ fontSize: { xs: 15, md: fluid(18, 14) } }}>{title}</Typography>
        <Box id={`${id}-hint`} sx={{ color: "#6A6566", fontSize: { xs: 14, md: fluid(18, 13) }, lineHeight: 1.2 }}>
          {hint && <div>{hint}</div>}
          {formats && <div>{formats}</div>}
        </Box>
        <input
          ref={inputRef}
          id={id}
          type="file"
          hidden
          multiple={multiple}
          accept={accept}
          onChange={(e) => {
            add(e.target.files);
            e.target.value = "";
          }}
        />
      </ButtonBase>

      {files.length > 0 && (
        <Box component="ul" sx={{ listStyle: "none", m: 0, mt: 1.5, p: 0, display: "grid", gap: 1 }}>
          {files.map((f, i) => (
            <Box
              component="li"
              key={f.name + i}
              sx={{ display: "flex", alignItems: "center", gap: 1, color: "common.white", bgcolor: "rgba(255,255,255,0.05)", borderRadius: 1, px: 1.5, py: 1 }}
            >
              <Typography sx={{ flex: 1, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {f.name} <Box component="span" sx={{ opacity: 0.6 }}>({(f.size / MB).toFixed(1)} MB)</Box>
              </Typography>
              <ButtonBase onClick={() => remove(i)} aria-label={`Remove ${f.name}`} sx={{ p: 0.5, borderRadius: 1, color: "common.white" }}>
                <CloseIcon fontSize="small" />
              </ButtonBase>
            </Box>
          ))}
        </Box>
      )}

      {message && (
        <Typography role="alert" sx={{ color: "#FF6B70", fontSize: { xs: 14, md: fluid(16, 13) }, mt: 1 }}>
          {message}
        </Typography>
      )}
    </Box>
  );
}

/** Privacy consent with the link to /privacy-policy. */
export function Consent({ id, checked, onChange, text, linkLabel, error }) {
  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: { xs: 1.5, md: fluid(30, 16) } }}>
        <Checkbox
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          icon={<CheckBoxOutlineBlankIcon />}
          checkedIcon={<CheckBoxIcon />}
          inputProps={{ "aria-required": true, "aria-invalid": !!error }}
          sx={{
            p: 0,
            mt: "2px",
            color: error ? "primary.main" : "rgba(255,255,255,0.35)",
            "&.Mui-checked": { color: "primary.main" },
            "& svg": { fontSize: { xs: 34, md: fluid(56, 34) } },
          }}
        />
        <Typography component="label" htmlFor={id} sx={{ color: "common.white", fontSize: { xs: 16, md: fluid(24, 15) }, lineHeight: 1.2, cursor: "pointer" }}>
          {text}{" "}
          <SpaLink to="/privacy-policy" target="_blank" sx={{ color: "#ED1B24", "&:hover": { textDecoration: "underline" } }}>
            {linkLabel}
          </SpaLink>
        </Typography>
      </Box>
      {error && (
        <Typography role="alert" sx={{ color: "#FF6B70", fontSize: { xs: 14, md: fluid(16, 13) }, mt: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}

export function SubmitButton({ label, loading }) {
  return (
    <ButtonBase
      type="submit"
      disabled={loading}
      sx={{
        width: "100%",
        height: { xs: 56, md: fluid(69, 52) },
        gap: fluid(20, 12),
        bgcolor: "#ED1C24",
        color: "common.white",
        borderRadius: fluid(8, 6),
        fontSize: { xs: 17, md: fluid(24, 16) },
        transition: "filter .2s ease",
        "&:hover": { filter: "brightness(1.08)" },
        "&.Mui-disabled": { opacity: 0.6, color: "common.white" },
      }}
    >
      {label}
      <ArrowForwardIcon sx={{ fontSize: { xs: 22, md: fluid(28, 20) } }} />
    </ButtonBase>
  );
}

/** Shown in place of the form once it has been sent. */
export function SuccessPanel({ title, body }) {
  const ref = useRef(null);
  // The form it replaces was much taller: bring the message into view.
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  return (
    <Box
      ref={ref}
      role="status"
      sx={{
        ...block(WIDE),
        bgcolor: "#131E17",
        border: "1px solid rgba(58, 181, 74, 0.25)",
        borderRadius: fluid(22, 14),
        px: { xs: 3, md: fluid(90, 32) },
        py: { xs: 4, md: fluid(44, 28) },
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "flex-start", sm: "center" },
        gap: { xs: 2, md: fluid(64, 24) },
        color: "common.white",
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          flexShrink: 0,
          width: { xs: 64, md: fluid(90, 64) },
          height: { xs: 64, md: fluid(90, 64) },
          borderRadius: "50%",
          border: "5px solid",
          borderColor: "brand.success",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Box component="svg" viewBox="0 0 24 24" sx={{ width: "55%", color: "brand.success" }}>
          <path d="M4 12.5l5 5L20 6.5" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        </Box>
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 600, fontSize: { xs: 17, md: fluid(18, 15) } }}>{title}</Typography>
        <Typography sx={{ fontSize: { xs: 16, md: fluid(18, 15) }, maxWidth: 620 }}>{body}</Typography>
      </Box>
    </Box>
  );
}

/** Invisible field bots fill in; the server rejects any submission that does. */
export function Honeypot({ value, onChange }) {
  return (
    <Box aria-hidden="true" sx={{ position: "absolute", left: "-10000px", top: 0, width: "1px", height: "1px", overflow: "hidden" }}>
      <label htmlFor="website">Website</label>
      <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
    </Box>
  );
}
