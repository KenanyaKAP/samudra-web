import { useEffect } from "react";
import { Box, Container, Typography } from "@mui/material";
import { FadeScroll } from "../ui/FadeScroll";
import { useSection } from "../../hooks/useSiteData";

/**
 * Article template for the About subpages without a bespoke layout
 * (Vision & Mission, Core Values, Awards). It reuses the hero image and the
 * two-column title | highlight + body block of the About Samudra page.
 *
 * @param {string} section - Site Content key, e.g. "aboutVision"
 */
function AboutArticle({ section }) {
  const { heroImage, title, highlight, paragraphs = [] } = useSection(section);

  useEffect(() => {
    if (title) document.title = `${title} - Samudra`;
  }, [title]);

  return (
    <>
      <Box
        component="img"
        src={heroImage}
        alt={title}
        sx={{
          width: "100vw",
          maxWidth: "100%",
          height: "500px",
          display: "block",
          objectFit: "cover",
        }}
      />

      <Container maxWidth="xxl" sx={{ py: 8 }}>
        <Box
          display={"flex"}
          flexDirection={{ xs: "column", md: "row" }}
          gap={6}
        >
          <Typography
            flex={1}
            display={"block"}
            variant="headingLarge"
            sx={{ textTransform: "uppercase" }}
          >
            {title}
          </Typography>
          <Box flex={2}>
            <FadeScroll>
              {highlight && (
                <Typography
                  flex={1}
                  display={"block"}
                  variant="headingSmall"
                  color="primary.main"
                >
                  {highlight}
                </Typography>
              )}
              {paragraphs.map((paragraph, i) => (
                <Typography
                  key={i}
                  mt={2}
                  variant="bodyLarge"
                  display={"block"}
                  color="text.secondary"
                  textAlign="justify"
                >
                  {paragraph}
                </Typography>
              ))}
            </FadeScroll>
          </Box>
        </Box>
      </Container>
    </>
  );
}

export default AboutArticle;
