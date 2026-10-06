import { Typography } from "@mui/material";
import { fluid } from "../../utils/design";

/**
 * Big uppercase section / page title (Montserrat Bold, 49–55 px in the
 * design). A "\n" in the text breaks the line ("Request\nA Proposal").
 */
function PageHeading({ children, size = 55, color = "common.white", component = "h1", sx = {} }) {
  return (
    <Typography
      component={component}
      sx={{
        fontSize: fluid(size, 30),
        fontWeight: 700,
        lineHeight: 1,
        // Matches the width of the designer's Montserrat Bold.
        letterSpacing: "-0.015em",
        textTransform: "uppercase",
        whiteSpace: "pre-line",
        color,
        m: 0,
        ...sx,
      }}
    >
      {children}
    </Typography>
  );
}

export default PageHeading;
