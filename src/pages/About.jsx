import { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useSection } from "../hooks/useSiteData";
import { cssUrl } from "../utils/cssUrl";
import { block, fluid, WIDE } from "../utils/design";
import { ROBOTO } from "../theme";
import { QuoteMark, RoundedFrame, SpeechBubble } from "../components/about/Frames";
import Paragraphs from "../components/ui/Paragraphs";
import PageHeading from "../components/ui/PageHeading";

// Each part of the page is one 1920×1080 frame of the design. From the lg
// breakpoint (1200 px) the frame keeps its 16:9 proportion and everything
// inside sits where the PDF puts it (x/y as a share of 1920/1080); narrower,
// there is not enough room for that, so the parts stack.
const FRAME = { xs: "auto", lg: "max(56.25vw, 700px)" };
const at = (x, y) => ({ position: { lg: "absolute" }, left: { lg: `${(x / 19.2).toFixed(3)}%` }, top: { lg: `${(y / 10.8).toFixed(3)}%` } });

const roboto = (px, weight = 300) => ({
  fontFamily: ROBOTO,
  fontWeight: weight,
  fontSize: { xs: Math.max(15, Math.round(px * 0.85)), lg: fluid(px, 13) },
});

const cover = (image, position = "center") => ({
  backgroundImage: cssUrl(image),
  backgroundSize: "cover",
  backgroundPosition: position,
  backgroundRepeat: "no-repeat",
});

/** "Message from the CEO": photo left, quote bubble, heading, letter. */
function CeoMessage({ ceo = {} }) {
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        height: FRAME,
        bgcolor: "#100F0D",
        ...cover(ceo.photo, "left center"),
        backgroundSize: { xs: "auto 520px", lg: "cover" },
        backgroundPosition: { xs: "28% top", lg: "left center" },
        pt: { xs: "470px", lg: 0 },
        pb: { xs: 8, lg: 0 },
        px: { xs: 2.5, sm: 4, lg: 0 },
        color: "common.white",
        overflow: "hidden",
      }}
    >
      {/* Quote in the red speech bubble */}
      <Box
        sx={{
          ...at(618, 243),
          position: "relative",
          width: { xs: "min(342px, 100%)", lg: fluid(342, 230) },
          minHeight: { xs: 380, lg: fluid(464, 312) },
          pt: { xs: "52px", lg: fluid(63, 40) },
          pl: { xs: "44px", lg: fluid(58, 36) },
          pr: { xs: "36px", lg: fluid(44, 26) },
          pb: { xs: "150px", lg: fluid(150, 100) },
          "@media (min-width: 1200px)": { position: "absolute" },
        }}
      >
        <SpeechBubble />
        <Typography sx={{ ...roboto(18), fontStyle: "italic", lineHeight: 1.17, position: "relative" }}>
          {ceo.quote}
        </Typography>
      </Box>

      {/* Heading + signature, right-aligned to x = 958 */}
      <Box
        sx={{
          position: { lg: "absolute" },
          left: 0,
          width: { lg: "49.9%" },
          top: { lg: `${(816 / 10.8).toFixed(3)}%` },
          textAlign: { xs: "left", lg: "right" },
          mt: { xs: 4, lg: 0 },
        }}
      >
        <Typography
          component="h1"
          sx={{ fontSize: { xs: 34, lg: fluid(41, 28) }, lineHeight: 1, textTransform: "uppercase" }}
        >
          <Box component="span" sx={{ display: "block", fontWeight: 300, whiteSpace: "pre-line" }}>
            {ceo.headingLight}
          </Box>
          <Box component="span" sx={{ display: "block", fontWeight: 600 }}>
            {ceo.headingBold}
          </Box>
        </Typography>
        <Typography sx={{ ...roboto(17, 500), lineHeight: 1, mt: { xs: 2, lg: fluid(30, 16) } }}>{ceo.name}</Typography>
        <Typography sx={{ ...roboto(17), lineHeight: 1, mt: "2px", color: "#EC192D" }}>{ceo.title}</Typography>
      </Box>

      {/* The letter, between the two quote marks */}
      <Box sx={{ ...at(1195, 239), width: { lg: fluid(572, 380) }, mt: { xs: 5, lg: 0 } }}>
        <QuoteMark sx={{ width: { xs: 64, lg: fluid(88, 60) }, height: "auto" }} />
        <Paragraphs
          text={ceo.body}
          gap="1.33em"
          sx={{ ...roboto(18), lineHeight: 1.33, mt: { xs: 2, lg: fluid(13, 8) } }}
        />
        <QuoteMark sx={{ width: { xs: 64, lg: fluid(88, 60) }, height: "auto", ml: "auto", mt: { xs: 2, lg: fluid(22, 12) } }} />
      </Box>
    </Box>
  );
}

/** Vision & Mission: red framed heading on the photo, text on the right. */
function VisionMission({ vision = {} }) {
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        height: FRAME,
        ...cover(vision.backgroundImage, "left center"),
        // Phones: the text sits on the photo, so darken it.
        backgroundImage: {
          xs: `linear-gradient(rgba(0,0,0,0.62), rgba(0,0,0,0.62)), ${cssUrl(vision.backgroundImage)}`,
          lg: cssUrl(vision.backgroundImage),
        },
        color: "common.white",
        px: { xs: 2.5, sm: 4, lg: 0 },
        py: { xs: 10, lg: 0 },
      }}
    >
      <Box
        sx={{
          ...at(418, 378),
          position: "relative",
          width: { xs: 260, lg: fluid(460, 280) },
          aspectRatio: "1",
          display: "flex",
          alignItems: "flex-end",
          pl: { xs: "36px", lg: fluid(65, 36) },
          pb: { xs: "34px", lg: fluid(64, 36) },
          "@media (min-width: 1200px)": { position: "absolute" },
        }}
      >
        <RoundedFrame />
        <Typography
          component="h2"
          sx={{ position: "relative", fontSize: { xs: 34, lg: fluid(57, 32) }, lineHeight: 1.17, textTransform: "uppercase" }}
        >
          <Box component="span" sx={{ display: "block", fontWeight: 300, color: "#EC192D" }}>
            {vision.headingAccent}
          </Box>
          <Box component="span" sx={{ display: "block", fontWeight: 600 }}>
            {vision.headingBold}
          </Box>
        </Typography>
      </Box>

      <Paragraphs
        text={vision.body}
        gap="1.5em"
        sx={{
          ...at(1171, 445),
          width: { lg: fluid(580, 400) },
          mt: { xs: 6, lg: 0 },
          ...roboto(24),
          lineHeight: 1.5,
        }}
      />
    </Box>
  );
}

/** About Samudra: heading + text in the curved frame, 40 years badge. */
function Company({ company = {} }) {
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        height: FRAME,
        bgcolor: "brand.charcoal",
        ...cover(company.backgroundImage, "left center"),
        backgroundSize: { xs: "auto 100%", lg: "cover" },
        color: "common.white",
        px: { xs: 2.5, sm: 4, lg: 0 },
        py: { xs: 10, lg: 0 },
      }}
    >
      <Box sx={{ ...at(670, 225), width: { lg: fluid(600, 420) }, position: { xs: "relative", lg: "absolute" }, zIndex: 1 }}>
        <PageHeading component="h2" size={48} sx={{ pl: { lg: fluid(6, 3) } }}>
          {company.heading}
        </PageHeading>
        <Typography sx={{ ...roboto(24), lineHeight: 1.5, mt: { xs: 3, lg: fluid(98, 50) } }}>{company.body}</Typography>
      </Box>
      {company.badgeImage && (
        <Box
          component="img"
          src={company.badgeImage}
          alt={company.badgeAlt || ""}
          loading="lazy"
          sx={{ ...at(1393, 296), width: { xs: 220, lg: fluid(342, 200) }, height: "auto", display: "block", mt: { xs: 6, lg: 0 } }}
        />
      )}
    </Box>
  );
}

/** Strategic Alliance: red section, logo column + text column per partner. */
function Alliance({ alliance = {} }) {
  return (
    <Box
      component="section"
      sx={{ bgcolor: "primary.main", color: "common.white", minHeight: FRAME, py: { xs: 10, lg: 0 } }}
    >
      <Box sx={{ ...block(WIDE), pt: { lg: fluid(71, 48) }, pb: { lg: fluid(120, 64) } }}>
        <PageHeading component="h2" size={55}>
          {alliance.heading}
        </PageHeading>
        <Box sx={{ mt: { xs: 6, lg: fluid(178, 80) }, display: "grid", rowGap: { xs: 7, lg: fluid(160, 70) } }}>
          {(alliance.items || []).map((item, i) => (
            <Box
              key={(item.title || "") + i}
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: `${fluid(553, 300)} 1fr` },
                alignItems: "center",
                gap: { xs: 3, lg: 0 },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: { xs: "flex-start", lg: "center" }, pl: { lg: fluid(80, 20) } }}>
                {item.logo && (
                  <Box
                    component="img"
                    src={item.logo}
                    alt={item.logoAlt || ""}
                    loading="lazy"
                    sx={{ width: { xs: 240, lg: fluid(i === 0 ? 315 : 400, 200) }, maxWidth: "100%", height: "auto" }}
                  />
                )}
              </Box>
              <Box sx={{ maxWidth: { lg: fluid(940, 520) } }}>
                <Typography component="h3" sx={{ fontSize: { xs: 19, lg: fluid(24, 16) }, fontWeight: 600 }}>
                  {item.title}
                </Typography>
                <Typography sx={{ mt: { xs: 2, lg: fluid(30, 14) }, fontSize: { xs: 16, lg: fluid(24, 15) }, lineHeight: 1.2 }}>
                  {item.body}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

function About() {
  const { ceo, vision, company, alliance, warehouse = {} } = useSection("about");

  useEffect(() => {
    document.title = "About - Samudra";
  }, []);

  return (
    <>
      <CeoMessage ceo={ceo} />
      <VisionMission vision={vision} />
      <Company company={company} />
      <Alliance alliance={alliance} />
      {warehouse.image && (
        <Box
          component="img"
          src={warehouse.image}
          alt={warehouse.alt || ""}
          loading="lazy"
          sx={{ width: "100%", height: "auto", display: "block" }}
        />
      )}
    </>
  );
}

export default About;
