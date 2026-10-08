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

const coverSx = (image) => ({
  backgroundImage: cssUrl(image),
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
});

function Home() {
  const { hero = {}, about = {}, services = {}, news = {}, map = {} } = useSection("home");
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
      <HeroCarousel slides={hero.slides || []} onScrollDown={() => scrollTo(aboutRef)} />

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
        <Box sx={{ ...block(WIDE), height: "100%", position: "relative", pt: { xs: 12, md: fluid(178, 96) } }}>
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
            {about.graphicImage && (
              <Box
                component="img"
                src={about.graphicImage}
                alt={about.graphicAlt || ""}
                sx={{ width: { xs: "88%", md: fluid(717, 380) }, height: "auto", mt: { md: fluid(14, 6) }, mr: { md: fluid(42, 10) } }}
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
        sx={{ ...coverSx(services.backgroundImage), height: SECTION_HEIGHT, minHeight: { md: 600 } }}
      >
        <Box sx={{ ...block(WIDE), pt: { xs: 10, md: fluid(148, 80) }, pb: { xs: 10, md: 0 } }}>
          {/* Site Content → Home → Services → Heading Color: "dark" on a
              light background image, "light" on a dark one. */}
          <PageHeading component="h2" size={49} color={services.headingColor === "light" ? "common.white" : "text.primary"}>
            {services.heading}
          </PageHeading>
          <Box
            sx={{
              mt: { xs: 5, md: fluid(112, 48) },
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
              gap: { xs: 3, md: fluid(32, 18) },
            }}
          >
            {(services.items || []).map((item, i) => (
              <ServiceCard
                key={item.title + i}
                variant="onRed"
                to={item.category ? `/services?category=${encodeURIComponent(item.category)}` : "/services"}
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
      <Box component="section" ref={mapRef} sx={{ bgcolor: "#000", lineHeight: 0 }}>
        {map.mapImage && (
          <Box
            component="img"
            src={map.mapImage}
            alt={map.alt || ""}
            loading="lazy"
            sx={{ width: "100%", height: "auto", display: "block" }}
          />
        )}
      </Box>
    </>
  );
}

export default Home;
