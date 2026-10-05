import { useEffect } from "react";
import { Box, Container, Grid, Typography } from "@mui/material";
import { FadeScroll } from "../../components/ui/FadeScroll";
import StatCounter from "../../components/about/StatCounter";
import { useSection } from "../../hooks/useSiteData";

/** /about/company — Site Content → About › About Samudra. */
function CompanyPage() {
  const {
    heroImage,
    intro = {},
    certifications = [],
    alliance = {},
    partner = {},
  } = useSection("aboutCompany");
  const title = intro.title;
  const stats = partner.stats || [];

  useEffect(() => {
    document.title = `${title} - Samudra`;
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

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* Section A — About US                                         */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Container maxWidth="xxl" sx={{ py: 8 }}>
        <Box
          display={"flex"}
          flexDirection={{ xs: "column", md: "row" }}
          gap={6}
        >
          <Typography flex={1} display={"block"} variant="headingLarge" sx={{ textTransform: "uppercase"}}>
            {title}
          </Typography>
          <Box flex={2}>
            <Typography
              flex={1}
              display={"block"}
              variant="headingSmall"
              color="primary.main"
            >
              {intro.highlight}
            </Typography>
            <Typography
              mt={2}
              variant="bodyLarge"
              display={"block"}
              color="text.secondary"
              textAlign="justify"
            >
              {intro.body}
            </Typography>
          </Box>
        </Box>

        <Box
          display={"flex"}
          gap={4}
          mt={20}
          flexDirection={{
            xs: "column",
            sm: "row",
          }}
        >
          {certifications.map((item, i) => (
            <Box flex={1} key={(item.title || "") + i}>
              <Box
                mx={"auto"}
                component="img"
                sx={{
                  width: "100%",
                  height: 100,
                  objectFit: "contain",
                }}
                alt="Who we are"
                src={item.image}
              />
              <Typography
                flex={1}
                display={"block"}
                variant="bodyLarge"
                fontWeight={600}
                color="primary.main"
              >
                {item.title}
              </Typography>
              <Typography
                mt={1}
                variant="bodyMedium"
                display={"block"}
                color="text.secondary"
              >
                {item.body}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* Section E — "Strategic Alliance"                              */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Box sx={{ bgcolor: "primary.main", py: { xs: 8, md: 10 } }}>
        <Container maxWidth="xxl">
          <FadeScroll>
            <Box display={"flex"} flexDirection={{ xs: "column", md: "row" }}>
              <Box flex={1}>
                <Typography
                  display={"block"}
                  variant="headingMedium"
                  color="text.light"
                  mb={2}
                >
                  {alliance.heading}
                </Typography>
              </Box>
              <Box flex={1.5}>
                <Typography
                  display={"block"}
                  variant="bodyLarge"
                  color="text.light"
                  sx={{ opacity: 0.9 }}
                >
                  {alliance.body}
                </Typography>
              </Box>
            </Box>
          </FadeScroll>

          {/* Partner logos placeholder */}
          <FadeScroll delay={0.2}>
            <Box
              component={"img"}
              src={alliance.image}
              sx={{
                width: "100%",
                objectFit: "cover",
                mt: 10,
                flex: 1,
                aspectRatio: "3/1",
                bgcolor: "lightgray",
                borderRadius: "0 0 0 48px",
              }}
            />
          </FadeScroll>
        </Container>
      </Box>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* Section D — "Flexible Strength, Beyond Expectations"          */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Container maxWidth="xxl" sx={{ py: { xs: 8, md: 12 } }}>
        <Box
          display="flex"
          flexDirection={{ xs: "column", md: "row" }}
          gap={{ xs: 4, md: 8 }}
        >
          {/* Left — Heading + Images */}
          <Box flex={1}>
            <FadeScroll>
              <Typography variant="headingLarge" color="primary.main" textTransform={"uppercase"}>
                {partner.heading}
              </Typography>
            </FadeScroll>

            <FadeScroll delay={0.2}>
              <Box mt={4} display="flex" gap={2}>
                <Box
                  component={"img"}
                  src={partner.image}
                  width={"100%"}
                  sx={{
                    flex: 1,
                    aspectRatio: "4/3",
                    objectFit: "cover",
                    bgcolor: "gray",
                  }}
                />
              </Box>
            </FadeScroll>
          </Box>

          {/* Right — Paragraph + Stats */}
          <Box flex={1.5}>
            {/* Stats Grid */}
            <FadeScroll delay={0.25}>
              <Grid container spacing={3} mt={4}>
                {stats.map((stat, i) => (
                  <Grid size={{ xs: 6 }} key={i}>
                    <StatCounter
                      value={Number(stat.value) || 0}
                      suffix={stat.suffix}
                      label={stat.label}
                      delay={i * 0.2}
                    />
                  </Grid>
                ))}
              </Grid>
            </FadeScroll>

            <FadeScroll delay={0.35}>
              <Typography
                display={"block"}
                variant="bodyLarge"
                color="text.secondary"
                textAlign="justify"
                mt={4}
              >
                {partner.body}
              </Typography>
            </FadeScroll>
          </Box>
        </Box>
      </Container>
    </>
  );
}

export default CompanyPage;
