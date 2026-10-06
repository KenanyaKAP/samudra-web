/** "+6221 8604622" → "tel:+62218604622" */
export function telHref(number) {
  return `tel:${String(number).replace(/[^\d+]/g, "")}`;
}

/** Non-empty entries of a list field (wp-admin may leave blank rows). */
export function filled(list) {
  return (Array.isArray(list) ? list : []).filter(
    (v) => typeof v === "string" && v.trim() !== "",
  );
}
