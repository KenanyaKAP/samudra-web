import { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useSection } from "../hooks/useSiteData";
import { block, EDGE, fluid, WIDE } from "../utils/design";
import { ROBOTO } from "../theme";

// The portraits and the crew photo are shot on pure black, so the page is
// pure black too (the design's #110F0D showed every portrait as a box), and
// their edges are faded out (FADE) to melt into it.
const PHOTO_BLACK = "#000";
const FADE = {
  WebkitMaskImage: "radial-gradient(ellipse 68% 74% at 50% 42%, #000 45%, transparent 98%)",
  maskImage: "radial-gradient(ellipse 68% 74% at 50% 42%, #000 45%, transparent 98%)",
};

function NameTag({ name, title, size = 24, sx = {} }) {
  return (
    <Box sx={{ textAlign: "center", fontFamily: ROBOTO, lineHeight: 1.3, ...sx }}>
      <Typography sx={{ fontFamily: ROBOTO, fontWeight: 500, fontSize: { xs: 16, md: fluid(size, 15) }, color: "common.white" }}>
        {name}
      </Typography>
      <Typography sx={{ fontFamily: ROBOTO, fontWeight: 300, fontSize: { xs: 15, md: fluid(size, 14) }, color: "#EC192D" }}>
        {title}
      </Typography>
    </Box>
  );
}

/**
 * A director: full-width photo with the name low on the left or right,
 * against that edge of the content.
 */
function Director({ person }) {
  const right = person.nameSide !== "left";
  const edge = { md: EDGE.md, lg: EDGE.lg };
  return (
    <Box component="figure" sx={{ position: "relative", m: 0, bgcolor: PHOTO_BLACK }}>
      <Box component="img" src={person.photo} alt={person.name} loading="lazy" sx={{ width: "100%", height: "auto", display: "block" }} />
      <Box
        component="figcaption"
        sx={{
          position: { xs: "static", md: "absolute" },
          bottom: fluid(150, 60),
          left: right ? "auto" : edge,
          right: right ? edge : "auto",
          py: { xs: 3, md: 0 },
        }}
      >
        <NameTag name={person.name} title={person.title} size={34} sx={{ textAlign: { md: right ? "right" : "left" } }} />
      </Box>
    </Box>
  );
}

// Offsets of the middle column in the 3-across group, as in the design:
// first row a little higher, second row noticeably lower.
const STAGGER = [-26, 81];

// From 1200 px the 3-across group follows the team photo instead: the second
// row is narrower (its outer people move in by a share of a column) and its
// middle person sits lower, so the six form a circle. The drop is a margin,
// not a transform, so the sections below move down with it.
const CIRCLE = { inset: "32%", drop: 180 };

/** One group of managers: portraits cut from the team shots, names below. */
function Group({ group, index }) {
  const members = group.members || [];
  const columns = members.length <= 4 ? members.length : 3;
  const portraitWidth = { 2: 680, 3: 470, 4: 445 }[columns] || 470;

  return (
    <Box
      component="section"
      aria-label={group.name}
      sx={{
        ...block(WIDE),
        display: "grid",
        gridTemplateColumns: { xs: "repeat(2, 1fr)", md: `repeat(${columns}, 1fr)` },
        columnGap: { xs: 2, md: fluid(20, 12) },
        rowGap: { xs: 5, md: fluid(30, 24) },
        pt: { xs: index ? 6 : 8, md: index ? fluid(110, 60) : fluid(130, 70) },
      }}
    >
      {members.map((m, i) => {
        const row = Math.floor(i / columns);
        const col = i % columns;
        const shift = columns === 3 && col === 1 ? STAGGER[row] || 0 : 0;
        // fluid() takes positive sizes, so the sign goes outside.
        const stagger = shift ? `translateY(calc(${Math.sign(shift)} * ${fluid(Math.abs(shift), 0)}))` : "none";
        const circleRow = columns === 3 && row === 1;
        const inset = circleRow && col !== 1 ? `translateX(${col === 0 ? "" : "-"}${CIRCLE.inset})` : null;
        return (
          <Box
            key={(m.name || "") + i}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              transform: { md: stagger, lg: circleRow ? inset || "none" : stagger },
              mt: { lg: circleRow && col === 1 ? fluid(CIRCLE.drop) : 0 },
            }}
          >
            {m.photo && (
              <Box
                component="img"
                src={m.photo}
                alt={m.name}
                loading="lazy"
                sx={{ width: { xs: "100%", md: fluid(portraitWidth, 180) }, maxWidth: "100%", aspectRatio: "4 / 5", objectFit: "cover", display: "block", ...FADE }}
              />
            )}
            <NameTag name={m.name} title={m.title} sx={{ mt: { xs: 1, md: `calc(-1 * ${fluid(24, 12)})` }, position: "relative" }} />
          </Box>
        );
      })}
    </Box>
  );
}

function People() {
  const { hero = {}, directors = [], groups = [], crew = {} } = useSection("people");

  useEffect(() => {
    document.title = "People - Samudra";
  }, []);

  return (
    <Box sx={{ bgcolor: PHOTO_BLACK, color: "common.white" }}>
      {/* Board of Directors */}
      <Box component="header" sx={{ position: "relative" }}>
        {hero.image && (
          <Box component="img" src={hero.image} alt={hero.alt || ""} sx={{ width: "100%", height: "auto", display: "block" }} />
        )}
        <Typography
          component="h1"
          sx={{
            position: "absolute",
            right: EDGE,
            bottom: { xs: 24, md: fluid(144, 48) },
            textAlign: "right",
            textTransform: "uppercase",
            fontSize: { xs: 26, md: fluid(41, 26) },
            lineHeight: 1,
          }}
        >
          <Box component="span" sx={{ display: "block", fontWeight: 300 }}>
            {hero.headingLight}
          </Box>
          <Box component="span" sx={{ display: "block", fontWeight: 600 }}>
            {hero.headingBold}
          </Box>
        </Typography>
      </Box>

      {directors.map((person, i) => (
        <Director key={(person.name || "") + i} person={person} />
      ))}

      {groups.map((group, i) => (
        <Group key={(group.name || "") + i} group={group} index={i} />
      ))}

      {crew.image && (
        <Box sx={{ ...block(WIDE), pt: { xs: 8, md: fluid(180, 80) }, pb: { xs: 8, md: fluid(110, 60) } }}>
          <Box
            component="img"
            src={crew.image}
            alt={crew.alt || ""}
            loading="lazy"
            sx={{
              width: "100%",
              height: "auto",
              display: "block",
              WebkitMaskImage: "radial-gradient(ellipse 62% 66% at 50% 52%, #000 70%, transparent 100%)",
              maskImage: "radial-gradient(ellipse 62% 66% at 50% 52%, #000 70%, transparent 100%)",
            }}
          />
        </Box>
      )}
    </Box>
  );
}

export default People;
