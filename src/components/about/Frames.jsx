import { useLayoutEffect, useRef, useState } from "react";
import { Box } from "@mui/material";

/**
 * Outline shapes of the About page, traced from the designer's PNG exports
 * (Asset 4 / Asset 5) and drawn as SVG so they stay sharp. Strokes do not
 * scale with the box.
 */

// The bubble of the design, 342 × 464: the tail is 130 wide and 124 tall,
// the bottom-left corner has a 38.5 radius.
const BUBBLE = { width: 342, tailWidth: 130, tailHeight: 124, radius: 38.5 };

/**
 * Speech bubble: square body, rounded bottom-left, tail bottom-right.
 *
 * It grows with its text, so it is drawn for the size it actually has: the
 * corner and the tail keep the design's proportions (scaled with the width)
 * and only the body gets taller or shorter. Stretching the design's shape
 * instead would squash the tail and flatten the corner.
 */
export function SpeechBubble({ color = "#ED1C24", strokeWidth = 3, sx = {} }) {
  const ref = useRef(null);
  const [size, setSize] = useState(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      setSize((prev) => (prev && prev.width === width && prev.height === height ? prev : { width, height }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  let d = "";
  if (size && size.width > 0) {
    const { width: w, height: h } = size;
    const k = w / BUBBLE.width;
    const s = strokeWidth / 2; // keeps the stroke inside the box
    const body = h - s - BUBBLE.tailHeight * k;
    const tip = w - s - BUBBLE.tailWidth * k;
    const r = BUBBLE.radius * k;
    d = `M${s} ${s}H${w - s}V${body}L${tip} ${h - s}V${body}H${s + r}A${r} ${r} 0 0 1 ${s} ${body - r}Z`;
  }

  return (
    <Box
      component="svg"
      ref={ref}
      viewBox={size ? `0 0 ${size.width} ${size.height}` : undefined}
      aria-hidden="true"
      sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", ...sx }}
    >
      {d && <path d={d} fill="none" stroke={color} strokeWidth={strokeWidth} />}
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
