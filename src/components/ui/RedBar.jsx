import { Box, Typography } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { fluid } from "../../utils/design";

/**
 * The red strip at the bottom of every card ("MORE →", "READ MORE →").
 * `height` and `fontSize` are design px at 1920. Purely visual: the whole
 * card is the link.
 */
function RedBar({ label, height = 38, fontSize = 17 }) {
  return (
    <Box
      sx={{
        height: fluid(height, Math.max(32, Math.round(height * 0.75))),
        bgcolor: "primary.main",
        color: "common.white",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: fluid(8, 6),
        px: fluid(Math.round(fontSize * 0.95), 12),
        flexShrink: 0,
      }}
    >
      <Typography
        component="span"
        sx={{ fontSize: fluid(fontSize, 13), fontWeight: 600, textTransform: "uppercase", lineHeight: 1 }}
      >
        {label}
      </Typography>
      <ArrowForwardIcon sx={{ fontSize: fluid(Math.round(fontSize * 1.25), 16) }} />
    </Box>
  );
}

export default RedBar;
