/**
 * Helpers that turn the 1920 px design (New Design.pdf) into responsive CSS.
 *
 * At 1920 wide every value equals the design exactly; below that it shrinks
 * with the viewport (so a 1440 screen sees the same layout, scaled) and stops
 * at a readable minimum. Above 1920 nothing grows any further.
 */

const vw = (px) => `${((px / 1920) * 100).toFixed(3)}vw`;

/** A size that is `px` in the design, never smaller than `min`. */
export function fluid(px, min = Math.round(px * 0.6)) {
  return `clamp(${min}px, ${vw(px)}, ${px}px)`;
}

/** Side gutter used below the large breakpoint. */
export const GUTTER = { xs: 20, sm: 32, md: 48 };

/**
 * Width of a horizontally centred block that is `px` wide in the design:
 * proportional on desktop, full width minus the gutters on smaller screens.
 */
export function blockWidth(px) {
  return {
    xs: `calc(100% - ${GUTTER.xs * 2}px)`,
    sm: `calc(100% - ${GUTTER.sm * 2}px)`,
    md: `calc(100% - ${GUTTER.md * 2}px)`,
    lg: `min(${px}px, ${vw(px)})`,
  };
}

/** sx for a centred block `px` wide in the design. */
export function block(px) {
  return { width: blockWidth(px), mx: "auto" };
}

/**
 * Content width of every page (x 70 → 1850 at 1920): the navbar, each
 * section and the footer all share these left and right edges.
 */
export const WIDE = 1780;

/**
 * Distance from the side of the viewport to the content edge, for things
 * positioned against the screen (fixed buttons, overlays on full-bleed
 * pictures) that must line up with the content.
 */
export const EDGE = {
  xs: `${GUTTER.xs}px`,
  sm: `${GUTTER.sm}px`,
  md: `${GUTTER.md}px`,
  lg: `calc((100% - min(${WIDE}px, ${vw(WIDE)})) / 2)`,
};
