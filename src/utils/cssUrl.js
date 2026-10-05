/** A CSS url() for an image path or URL coming from Site Content. */
export function cssUrl(src) {
  if (!src) return "none";
  return `url("${String(src).replace(/["\\\n]/g, "\\$&")}")`;
}
