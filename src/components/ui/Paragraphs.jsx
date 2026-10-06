import { Box } from "@mui/material";

/**
 * Plain text from Site Content as paragraphs: a blank line starts a new
 * paragraph, a single line break stays a line break.
 */
function Paragraphs({ text, gap = "1em", sx = {} }) {
  const paragraphs = String(text || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <Box sx={sx}>
      {paragraphs.map((p, i) => (
        <Box component="p" key={i} sx={{ m: 0, mt: i ? gap : 0, whiteSpace: "pre-line" }}>
          {p}
        </Box>
      ))}
    </Box>
  );
}

export default Paragraphs;
