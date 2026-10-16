import { useEffect, useRef, useState } from "react";
import { Box, ButtonBase } from "@mui/material";
import { useSection } from "../hooks/useSiteData";
import { fetchLatestNews } from "../services/wpApi";
import { cssUrl } from "../utils/cssUrl";
import { block, fluid, WIDE } from "../utils/design";
import HeroCarousel from "../components/home/HeroCarousel";
import NewsCarousel from "../components/home/NewsCarousel";
import ServiceCard from "../components/ui/ServiceCard";
import PageHeading from "../components/ui/PageHeading";
import RedBar from "../components/ui/RedBar";
import SpaLink from "../components/ui/SpaLink";
import Chevron from "../components/ui/Chevron";

// Every Home section is one 1920×1080 artboard in the design: on desktop it
// keeps that 16:9 proportion, on phones it grows with its content.
const SECTION_HEIGHT = { xs: "auto", md: "56.25vw" };

// The office map below md: a 600 px tall window on the image, which is
// drawn taller so that its empty black above and below the islands (shares
// of its height) is trimmed; scrolled `start` of the way in on load.
const MAP_TRIM = { top: 0.15, bottom: 0.12 };
const MAP = {
  height: "600px",
  imageHeight: `${Math.round(600 / (1 - MAP_TRIM.top - MAP_TRIM.bottom))}px`,
  trimTop: MAP_TRIM.top,
  start: 0.12,
};

const coverSx = (image) => ({
  backgroundImage: cssUrl(image),
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
});

function Home() {
  const {
    hero = {},
    about = {},
    services = {},
    news = {},
    map = {},
  } = useSection("home");
  const [latestNews, setLatestNews] = useState([]);
  const aboutRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    document.title = "Samudra — Your Exhibition Partner";

    // Latest posts from wp-admin → News
    fetchLatestNews(6)
      .then(setLatestNews)
      .catch(() => {
        // WordPress unreachable: the strip stays empty
      });
  }, []);

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <HeroCarousel
        slides={hero.slides || []}
        onScrollDown={() => scrollTo(aboutRef)}
      />

      {/* ── About: "Redefining Experiences" ──────────────────────── */}
      <Box
        component="section"
        ref={aboutRef}
        sx={{
          ...coverSx(about.backgroundImage),
          position: "relative",
          height: SECTION_HEIGHT,
          minHeight: { xs: 560, md: 600 },
        }}
      >
        <Box
          sx={{
            ...block(WIDE),
            height: "100%",
            position: "relative",
            pt: { xs: 12, md: fluid(178, 96) },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 5,
            }}
          >
            <PageHeading component="h2" size={49}>
              {about.heading}
            </PageHeading>
            {/* Centred in the section from md (the client's revision of
                Oct 2026; the PDF has it top right), a little above the
                middle. */}
            {about.graphicImage && (
              <Box
                component="img"
                src={about.graphicImage}
                alt={about.graphicAlt || ""}
                sx={{
                  width: { xs: "88%", md: fluid(717, 380) },
                  height: "auto",
                  position: { md: "absolute" },
                  left: { md: "50%" },
                  top: { md: "47.5%" },
                  transform: { md: "translate(-50%, -50%)" },
                }}
              />
            )}
          </Box>

          <SpaLink
            to={about.buttonLink || "/about"}
            sx={{
              position: { xs: "static", md: "absolute" },
              display: "inline-block",
              mt: { xs: 8, md: 0 },
              mb: { xs: 6, md: 0 },
              left: 0,
              bottom: fluid(60, 32),
              width: { xs: 190, md: fluid(178, 150) },
              transition: "filter .2s ease",
              "&:hover": { filter: "brightness(1.1)" },
            }}
          >
            <RedBar label={about.buttonLabel} height={38} fontSize={17} />
          </SpaLink>
        </Box>
      </Box>

      {/* ── Service ──────────────────────────────────────────────── */}
      <Box
        component="section"
        sx={{
          ...coverSx(services.backgroundImage),
          position: "relative",
          height: SECTION_HEIGHT,
          minHeight: { md: 600 },
        }}
      >
        {/* About and Service continue one background picture; this red rule
            marks where one section ends. */}
        <Box
          aria-hidden="true"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: fluid(2, 1),
            bgcolor: "primary.main",
          }}
        />
        <Box
          sx={{
            ...block(WIDE),
            pt: { xs: 10, md: fluid(148, 80) },
            pb: { xs: 10, md: 0 },
          }}
        >
          {/* Site Content → Home → Services → Heading Color: "dark" on a
              light background image, "light" on a dark one. */}
          <PageHeading
            component="h2"
            size={49}
            color={
              services.headingColor === "light"
                ? "common.white"
                : "text.primary"
            }
          >
            {services.heading}
          </PageHeading>
          <Box
            sx={{
              mt: { xs: 5, md: fluid(112, 48) },
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: { xs: 3, md: fluid(32, 18) },
            }}
          >
            {(services.items || []).map((item, i) => (
              <ServiceCard
                key={item.title + i}
                variant="onRed"
                to={
                  item.category
                    ? `/services?category=${encodeURIComponent(item.category)}`
                    : "/services"
                }
                image={item.image}
                title={item.title}
                description={item.description}
                buttonLabel={services.buttonLabel}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {/* ── News ─────────────────────────────────────────────────── */}
      <Box
        component="section"
        sx={{
          ...coverSx(news.backgroundImage),
          position: "relative",
          height: SECTION_HEIGHT,
          minHeight: { md: 600 },
          pb: { xs: 10, md: 0 },
        }}
      >
        <Box sx={{ ...block(WIDE), pt: { xs: 10, md: fluid(77, 48) } }}>
          <PageHeading component="h2" size={50}>
            {news.heading}
          </PageHeading>
        </Box>
        <Box sx={{ mt: { xs: 5, md: fluid(148, 48) } }}>
          <NewsCarousel items={latestNews} buttonLabel={news.buttonLabel} />
        </Box>
        <ButtonBase
          onClick={() => scrollTo(mapRef)}
          aria-label="Scroll down"
          sx={{
            display: { xs: "none", md: "flex" },
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            bottom: fluid(44, 20),
            p: 1,
            color: "common.white",
          }}
        >
          <Chevron direction="down" size={fluid(70, 50)} strokeWidth={4} />
        </ButtonBase>
      </Box>

      {/* ── Map of the offices ───────────────────────────────────── */}
      <Box
        component="section"
        ref={mapRef}
        sx={{ bgcolor: "#000", lineHeight: 0 }}
      >
        {map.mapImage && (
          // Below md the labels would be too small at the screen's width, so
          // the map keeps a readable height (its empty top and bottom
          // trimmed) and scrolls sideways.
          <Box
            role="region"
            aria-label={map.alt || "Map"}
            tabIndex={0}
            sx={{
              height: { xs: MAP.height, md: "auto" },
              overflowX: { xs: "auto", md: "hidden" },
              overflowY: "hidden",
            }}
          >
            <Box
              component="img"
              src={map.mapImage}
              alt={map.alt || ""}
              loading="lazy"
              // Start with Medan in view and the next label peeking in, so
              // it is clear there is more to the right.
              onLoad={(e) => {
                const scroller = e.currentTarget.parentElement;
                scroller.scrollLeft =
                  (scroller.scrollWidth - scroller.clientWidth) * MAP.start;
              }}
              sx={{
                display: "block",
                width: { xs: "auto", md: "100%" },
                maxWidth: { xs: "none", md: "100%" },
                height: { xs: MAP.imageHeight, md: "auto" },
                mt: { xs: `calc(-1 * ${MAP.imageHeight} * ${MAP.trimTop})`, md: 0 },
              }}
            />
          </Box>
        )}
      </Box>
    </>
  );
}

export default Home;
