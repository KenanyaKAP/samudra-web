import { Fragment } from "react";
import { Typography, Link as MuiLink } from "@mui/material";
import { filled, telHref } from "../../utils/offices";

const linkSx = {
  color: "text.light",
};

/** Comma-separated tel: links, as the footer prints them. */
function PhoneLinks({ numbers }) {
  return numbers.map((number, i) => (
    <Fragment key={number + i}>
      {i > 0 && ", "}
      <MuiLink href={telHref(number)} sx={linkSx}>
        {number}
      </MuiLink>
    </Fragment>
  ));
}

/**
 * One office in the footer: city heading, then company (headquarter only),
 * address lines and linked Phone / Fax / Email lines.
 *
 * Site Content → Global → Offices. The same data feeds the Contact page.
 */
function OfficeBlock({ office = {} }) {
  const address = filled(office.address);
  const phones = filled(office.phones);
  const fax = filled(office.fax);
  const lines = office.company ? [office.company, ...address] : address;

  return (
    <>
      <Typography
        display={"block"}
        variant="headingSmall"
        color="text.light"
        fontWeight={700}
      >
        {String(office.city || "").toUpperCase()}
      </Typography>
      <Typography
        mt={1}
        display={"block"}
        variant="bodyMedium"
        color="text.light"
      >
        {lines.map((line, i) => (
          <Fragment key={line + i}>
            {i > 0 && <br />}
            {line}
          </Fragment>
        ))}
        {phones.length > 0 && (
          <>
            <br />
            Phone: <PhoneLinks numbers={phones} />
          </>
        )}
        {fax.length > 0 && (
          <>
            <br />
            Fax: <PhoneLinks numbers={fax} />
          </>
        )}
        {office.email && (
          <>
            <br />
            Email:{" "}
            <MuiLink href={`mailto:${office.email}`} sx={linkSx}>
              {office.email}
            </MuiLink>
          </>
        )}
        <br />
      </Typography>
    </>
  );
}

export default OfficeBlock;
