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

/**
 * The plain-text contact lines the Contact page prints under an office:
 * "Phone: a, b", "Fax: c", "Email: d" — each only when it has a value.
 */
export function officeContactLines(office = {}) {
  const lines = [];
  const phones = filled(office.phones);
  const fax = filled(office.fax);
  if (phones.length) lines.push(`Phone: ${phones.join(", ")}`);
  if (fax.length) lines.push(`Fax: ${fax.join(", ")}`);
  if (office.email) lines.push(`Email: ${office.email}`);
  return lines;
}

/** [a, b, c, d, e] → [[a, b], [c, d], [e]] */
export function pairs(list) {
  const out = [];
  for (let i = 0; i < list.length; i += 2) out.push(list.slice(i, i + 2));
  return out;
}
