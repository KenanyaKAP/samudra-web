import { Box, Container, Typography, Grid, Button } from "@mui/material";
import { FadeScroll } from "../components/ui/FadeScroll";
import SectionHeading from "../components/ui/SectionHeading";
import { useNavigation } from "../hooks/useNavigation";
import { useSection } from "../hooks/useSiteData";

export default function About() {
  const { navigateWithFade } = useNavigation();
  const { heading, items = [] } = useSection("about");

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* Section A — Join the Masterminds Behind the Structure            */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Container maxWidth="xxl" sx={{ py: 8, mt: 10 }}>
        <Box
          display={"flex"}
          flexDirection={{ xs: "column", md: "row" }}
          gap={6}
        >
          {/* <Typography flex={1} display={"block"} variant="headingMedium">
            Join the Masterminds Behind the Structure
          </Typography> */}
          <Box flex={1}>
            <SectionHeading title={heading} color="text.secondary" />
          </Box>
        </Box>

        {/* Grid 2 column for sm, 3 for md, 1 for xs */}
        <Grid container spacing={10} mt={4} mx={10}>
          {items.map((item, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 6 }} key={i}>
              <FadeScroll delay={i * 0.08}>
                <Box
                  sx={{
                    height: "100%",
                    bgcolor: "rgba(61, 61, 61, 0.88)",
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box
                    component="img"
                    src={item.image}
                    alt={item.title}
                    sx={{
                      width: "100%",
                      aspectRatio: "4/3",
                      objectFit: "cover",
                      mb: 2,
                      borderBottomLeftRadius: 48,
                    }}
                  />
                  <Typography
                    display="block"
                    variant="bodyLarge"
                    color="text.light"
                    fontWeight={700}
                    textTransform="uppercase"
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    mt={1}
                    display="block"
                    variant="bodySmall"
                    color="text.light"
                    sx={{ opacity: 0.85, flex: 1 }}
                  >
                    {item.description}
                  </Typography>
                  <Box display="flex" justifyContent="flex-end" mt={2}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => navigateWithFade(item.link)}
                      sx={{
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        borderRadius: 0,
                        px: 1.8,
                        py: 0.7,
                      }}
                    >
                      Read More →
                    </Button>
                  </Box>
                </Box>
              </FadeScroll>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
}
