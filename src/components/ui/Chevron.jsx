import { Box } from "@mui/material";

const PATHS = {
  left: "M38 2 2 35l36 33",
  right: "M2 2l36 33L2 68",
  down: "M2 2l33 36L68 2",
};

/**
 * The thin white chevrons of the design: carousel arrows (40×70) and the
 * "scroll down" cue (70×40).
 */
function Chevron({ direction = "right", size, strokeWidth = 3, sx = {} }) {
  const horizontal = direction === "down";
  return (
    <Box
      component="svg"
      viewBox={horizontal ? "0 0 70 40" : "0 0 40 70"}
      aria-hidden="true"
      sx={{
        width: horizontal ? size : "auto",
        height: horizontal ? "auto" : size,
        display: "block",
        overflow: "visible",
        ...sx,
      }}
    >
      <path d={PATHS[direction]} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="miter" />
    </Box>
  );
}

export default Chevron;
