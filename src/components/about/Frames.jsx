import { Box } from "@mui/material";

/**
 * Outline shapes of the About page, traced from the designer's PNG exports
 * (Asset 4 / Asset 5) and drawn as SVG so they stay sharp and can stretch
 * with their text. Strokes do not scale with the box.
 */

/** Speech bubble: square body, rounded bottom-left, tail bottom-right. */
export function SpeechBubble({ color = "#ED1C24", strokeWidth = 3, sx = {} }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 342 464"
      preserveAspectRatio="none"
      aria-hidden="true"
      sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", ...sx }}
    >
      <path
        d="M1.5 1.5H340.5V338.5L210.5 462.5V338.5H40A38.5 38.5 0 0 1 1.5 300Z"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
      />
    </Box>
  );
}

/** The design's quote marks: two small grey speech bubbles. */
export function QuoteMark({ sx = {} }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 88 56"
      aria-hidden="true"
      sx={{ width: 88, height: 56, display: "block", ...sx }}
    >
      {[0, 47].map((x) => (
        <path
          key={x}
          transform={`translate(${x} 0) scale(${40 / 342} ${54 / 464})`}
          d="M1.5 1.5H340.5V338.5L210.5 462.5V338.5H40A38.5 38.5 0 0 1 1.5 300Z"
          fill="none"
          stroke="#45423F"
          strokeWidth={1.4}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </Box>
  );
}

/** Square frame with a rounded bottom-left corner (Vision & Mission). */
export function RoundedFrame({ color = "#ED1C24", strokeWidth = 8, sx = {} }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 460 460"
      preserveAspectRatio="none"
      aria-hidden="true"
      sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", ...sx }}
    >
      <path
        d="M4 4H456V456H80A76 76 0 0 1 4 380Z"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
      />
    </Box>
  );
}
