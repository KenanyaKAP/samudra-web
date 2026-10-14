import { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useSection } from "../hooks/useSiteData";
import { block, fluid, WIDE } from "../utils/design";
import PageHeading from "../components/ui/PageHeading";
import RedBar from "../components/ui/RedBar";
import SpaLink from "../components/ui/SpaLink";

/**
 * Any path React Router does not know. WordPress answers the same paths with
 * a 404 status (samudra_spa_status() in theme/functions.php).
 */
export default function NotFound() {
  const { heading, body, buttonLabel } = useSection("notFound");

  // Most pages never set a title, so put the previous one back on the way out.
  useEffect(() => {
    const previous = document.title;
    document.title = "Page Not Found - Samudra";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <Box sx={{ bgcolor: "brand.page", color: "common.white", minHeight: "70vh", pt: { xs: 16, md: fluid(260, 170) }, pb: { xs: 10, md: fluid(160, 90) } }}>
      <Box sx={block(WIDE)}>
        <PageHeading size={55}>{heading}</PageHeading>
        <Typography sx={{ mt: { xs: 3, md: fluid(30, 20) }, fontSize: { xs: 17, md: fluid(24, 16) }, maxWidth: 720 }}>{body}</Typography>
        <SpaLink to="/" sx={{ display: "inline-block", mt: { xs: 5, md: fluid(56, 36) }, width: { xs: 240, md: fluid(260, 220) }, "&:hover": { filter: "brightness(1.1)" } }}>
          <RedBar label={buttonLabel} height={45} fontSize={17} />
        </SpaLink>
      </Box>
    </Box>
  );
}
