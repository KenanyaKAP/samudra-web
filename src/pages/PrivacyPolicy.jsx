import { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useSection } from "../hooks/useSiteData";
import { block, fluid } from "../utils/design";
import PageHeading from "../components/ui/PageHeading";
import Paragraphs from "../components/ui/Paragraphs";

/** /privacy-policy — linked from both forms; text from Site Content. */
function PrivacyPolicy() {
  const { heading, lastUpdated, body } = useSection("privacyPolicy");

  useEffect(() => {
    document.title = `${heading || "Privacy Policy"} - Samudra`;
  }, [heading]);

  return (
    <Box sx={{ bgcolor: "common.white", color: "brand.ink", pt: { xs: 14, md: fluid(220, 150) }, pb: { xs: 10, md: fluid(140, 80) } }}>
      <Box sx={block(1220)}>
        <PageHeading size={55} color="brand.ink">
          {heading}
        </PageHeading>
        {lastUpdated && <Typography sx={{ mt: 2, color: "text.secondary", fontSize: { xs: 15, md: fluid(18, 14) } }}>{lastUpdated}</Typography>}
        <Paragraphs text={body} gap="1em" sx={{ mt: { xs: 4, md: fluid(48, 28) }, fontSize: { xs: 16, md: fluid(21, 16) }, lineHeight: 1.75 }} />
      </Box>
    </Box>
  );
}

export default PrivacyPolicy;
