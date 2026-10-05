import { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { FadeScroll } from "../components/ui/FadeScroll";
import { useNavigation } from "../hooks/useNavigation";
import { useSection } from "../hooks/useSiteData";
import ImageCarousel from "../components/ui/ImageCarousel";
import SectionHeading from "../components/ui/SectionHeading";
import NewsCard from "../components/home/NewsCard";
import TestimonialCarousel from "../components/home/TestimonialCarousel";
import { fetchLatestNews } from "../services/wpApi";
import { cssUrl } from "../utils/cssUrl";

// Layout offsets of the About block (not content, so not in Site Content).
const aboutSectionOffsets = {
  headingTop: { xs: 40, md: 100 },
  textBottom: { xs: 100, md: 120 },
  buttonBottom: { xs: 40, md: 60 },
};

// ─── COMPONENT ──────────────────────────────────────────────────────
function Home() {
  const { navigateWithFade } = useNavigation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { hero = {}, about = {}, services = {}, testimonials = {}, news = {}, partner = {} } =
    useSection("home");

  const [latestNews, setLatestNews] = useState([]);

  useEffect(() => {
    document.title = "Samudra — Your Exhibition Partner";

    // Latest posts from wp-admin → News
    fetchLatestNews(6)
      .then((items) => setLatestNews(items))
      .catch(() => {
        // WordPress unreachable: the strip stays empty
      });
  }, []);

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* Section A — Hero Carousel                                     */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Box sx={{ position: "relative" }}>
        <ImageCarousel
          images={hero.slides || []}
          height={isMobile ? "100svh" : "100svh"}
          duration={5000}
          showDots={isMobile ? false : true}
          showText={true}
          useArrow={true}
          useAnimation="slide"
          arrowSize={isMobile ? 60 : 120}
          gradientOverlay={true}
          dotsAlign="right"
          buttonText={hero.buttonLabel}
          onButtonClick={() => navigateWithFade(hero.buttonLink || "/services")}
        />
      </Box>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* Section B — "Your Exhibition Partner"                          */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Box
        sx={{
          position: "relative",
          minHeight: { xs: "100svh", md: "100svh" },
          display: "flex",
          alignItems: "flex-end",
          backgroundImage:
            `linear-gradient(90deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.25) 100%), ${cssUrl(about.backgroundImage)}`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="xxl">
          <Box
            sx={{
              width: { xs: "100%", md: "40%" },
              minHeight: { xs: "100svh", md: "100svh" },
              py: { xs: 4, md: 6 },
              position: "relative",
            }}
          >
            <FadeScroll>
              <Box
                sx={{
                  position: "absolute",
                  top: aboutSectionOffsets.headingTop,
                  left: 0,
                  right: 0,
                }}
              >
                <SectionHeading title={about.heading} color="text.light" sx={{ mb: 0 }} />
              </Box>
            </FadeScroll>

            <FadeScroll delay={0.1}>
              <Box
                sx={{
                  position: "absolute",
                  bottom: aboutSectionOffsets.textBottom,
                  left: 0,
                  right: 0,
                }}
              >
                <Typography
                  display="block"
                  variant="bodyLarge"
                  color="text.light"
                  textAlign="left"
                  sx={{ opacity: 0.92 }}
                >
                  {about.body}
                </Typography>
              </Box>
            </FadeScroll>

            <FadeScroll delay={0.2}>
              <Box
                sx={{
                  position: "absolute",
                  bottom: aboutSectionOffsets.buttonBottom,
                  left: 0,
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigateWithFade(about.buttonLink || "/about")}
                  sx={{
                    px: 2,
                    py: 0.8,
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    borderRadius: 0,
                    transition: "transform 0.2s ease, filter 0.2s ease",
                    "&:hover": {
                      transform: "translateX(2px)",
                      filter: "brightness(1.06)",
                    },
                  }}
                >
                  {about.buttonLabel}
                </Button>
              </Box>
            </FadeScroll>
          </Box>
        </Container>
      </Box>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* Section C — "Our Service"                                     */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Box
        sx={{
          position: "relative",
          py: { xs: 8, md: 12 },
          backgroundImage:
            `linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.35) 100%), ${cssUrl(services.backgroundImage)}`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="xxl">
          <SectionHeading title={services.heading} />

          <Grid container spacing={2} mt={8} mb={10}>
            {(services.items || []).map((service, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                <Box
                  sx={{
                    height: "100%",
                    bgcolor: "rgba(0, 0, 0, 0.68)",
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box
                    component="img"
                    src={service.image}
                    alt={service.title}
                    sx={{
                      width: "100%",
                      aspectRatio: "1/1",
                      objectFit: "cover",
                      borderRadius: "0 0 0 56px",
                      mb: 2,
                    }}
                  />

                  <Typography
                    display="block"
                    variant="bodyLarge"
                    color="text.light"
                    fontWeight={700}
                    textTransform="uppercase"
                  >
                    {service.title}
                  </Typography>

                  <Typography
                    mt={1.5}
                    display="block"
                    variant="bodyMedium"
                    color="text.light"
                    sx={{ opacity: 0.9 }}
                  >
                    {service.description}
                  </Typography>

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() =>
                      navigateWithFade(
                        service.category
                          ? `/services?category=${encodeURIComponent(service.category)}`
                          : "/services",
                      )
                    }
                    sx={{
                      mt: 2,
                      alignSelf: "flex-end",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      borderRadius: 0,
                      px: 1.8,
                      py: 0.7,
                    }}
                  >
                    Read More -&gt;
                  </Button>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* Section D — "CLIENT TESTIMONIALS"                               */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "background.paper" }}>
        <Container maxWidth="xxl">
          <SectionHeading title={testimonials.heading} />
          <Box mt={6}>
            <TestimonialCarousel testimonials={testimonials.items || []} />
          </Box>
        </Container>
      </Box>
      
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* Section E — "Latest News"                                     */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          backgroundImage:
            `linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.72) 100%), ${cssUrl(news.backgroundImage)}`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="xxl">
          <SectionHeading title={news.heading} color="text.light" />

          {/* <Grid container spacing={3} mt={4}>
            {newsItems.map((news, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                <FadeScroll delay={i * 0.1}>
                  <NewsCard title={news.title} date={news.date} index={i} />
                </FadeScroll>
              </Grid>
            ))}
          </Grid> */}
        </Container>
        <Box
          mt={4}
          display={"flex"}
          gap={3}
          sx={{
            overflowX: "scroll",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": { display: "none" },
            pb: 1,
            overflowY: "clip",
            px: 6,
          }}
        >
          {latestNews.map((news, i) => (
            <Box
              key={news.id || i}
              sx={{
                minWidth: { xs: "280px", sm: "360px", md: "380px" },
                width: { xs: "80vw", sm: "42vw", md: "30vw" },
                maxWidth: "420px",
                flexShrink: 0,
              }}
            >
              <FadeScroll delay={i * 0.0}>
                <NewsCard
                  title={news.title}
                  date={news.date}
                  description={news.description}
                  image={news.coverImage || news.image}
                  index={i}
                  onClick={() =>
                    news.slug
                      ? navigateWithFade(`/events/${news.slug}`)
                      : undefined
                  }
                />
              </FadeScroll>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* Section H — Branch Map "Your Exhibition Partner"              */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Box sx={{ pt: { xs: 8, md: 10 } }}>
        <Container maxWidth="xxl">
          <FadeScroll>
            <Typography
              variant="headingLarge"
              color="primary.main"
              textAlign="center"
              display="block"
              mb={1}
            >
              {partner.heading}
            </Typography>
          </FadeScroll>
        </Container>
      </Box>
      <Container
        maxWidth={"xxl"}
        disableGutters
        sx={{
          px: 0,
        }}
      >
        {/* Map placeholder with branch markers */}
        <Box
          component={"img"}
          src={partner.mapImage}
          sx={{
            width: "100%",
            objectFit: "cover",
            mt: 6,
            flex: 1,
            pb: { xs: 8, md: 10 },
          }}
        />
      </Container>
    </>
  );
}

export default Home;
