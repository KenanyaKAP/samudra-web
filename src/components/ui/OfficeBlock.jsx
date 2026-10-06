import { Fragment } from "react";
import { Box, Typography, Link as MuiLink } from "@mui/material";
import { filled, telHref } from "../../utils/offices";
import { fluid } from "../../utils/design";

const linkSx = { color: "inherit", textDecoration: "none", "&:hover": { textDecoration: "underline" } };

/** "Phone : +62 21 …  +62 21 …" with every number a tel: link. */
function NumberLine({ label, numbers }) {
  if (!numbers.length) return null;
  return (
    <Box component="span" sx={{ display: "block" }}>
      {label} :{" "}
      {numbers.map((number, i) => (
        <Fragment key={number + i}>
          {i > 0 && " "}
          <MuiLink href={telHref(number)} sx={linkSx}>
            {number}
          </MuiLink>
        </Fragment>
      ))}
    </Box>
  );
}

/**
 * One office in the footer: city heading, then company (headquarter only),
 * address lines and Phone / HP / Fax / Email.
 *
 * Site Content → Global → Offices.
 */
function OfficeBlock({ office = {} }) {
  const address = filled(office.address);
  const lines = office.company ? [office.company, ...address] : address;

  return (
    <Box sx={{ color: "common.white" }}>
      <Typography
        component="h3"
        sx={{ fontSize: fluid(28, 20), fontWeight: 600, textTransform: "uppercase", lineHeight: 1.2 }}
      >
        {office.city}
      </Typography>
      <Typography
        component="address"
        sx={{ mt: fluid(14, 8), fontStyle: "normal", fontSize: fluid(17, 14), lineHeight: 1.5 }}
      >
        {lines.map((line) => (
          <Box component="span" key={line} sx={{ display: "block" }}>
            {line}
          </Box>
        ))}
        <NumberLine label="Phone" numbers={filled(office.phones)} />
        <NumberLine label="HP" numbers={filled(office.mobile)} />
        <NumberLine label="Fax" numbers={filled(office.fax)} />
        {office.email && (
          <Box component="span" sx={{ display: "block" }}>
            Email :{" "}
            <MuiLink href={`mailto:${office.email}`} sx={linkSx}>
              {office.email}
            </MuiLink>
          </Box>
        )}
      </Typography>
    </Box>
  );
}

export default OfficeBlock;
