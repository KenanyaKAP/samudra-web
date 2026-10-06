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

/** Content width of the full-bleed pages (x 70 → 1850 in the design). */
export const WIDE = 1780;
