import { Box, Typography } from "@mui/material";
import SpaLink from "./SpaLink";
import RedBar from "./RedBar";
import { fluid } from "../../utils/design";

// Design px at 1920 for the two card sizes of New Design.pdf: the 492 px
// cards (Home strip, News grid) and the 1018 px lead story on /events.
const SIZES = {
  regular: { padX: 25, padTop: 17, date: 15, title: 21, gap: 20, excerpt: 15, minBody: 250, bar: 45, barText: 20 },
  featured: { padX: 52, padTop: 30, date: 31, title: 63, gap: 40, excerpt: 31, minBody: 470, bar: 92, barText: 41 },
};

/**
 * News card: cover photo, date, title, excerpt and a red "READ MORE →" strip
 * on a near-black body.
 */
function NewsCard({ to, image, date, title, description, buttonLabel, size = "regular", imageRatio }) {
  const s = SIZES[size] || SIZES.regular;
  const featured = size === "featured";

  return (
    <SpaLink to={to} sx={{ display: "flex", flexDirection: "column", height: "100%", color: "common.white" }}>
      <Box
        sx={{
          aspectRatio: imageRatio || (featured ? "1018 / 628" : "492 / 303"),
          bgcolor: "#2b2b2b",
          overflow: "hidden",
          flexShrink: 0,
          "& img": { transition: "transform .5s ease" },
          "@media (hover: hover)": { "a:hover & img": { transform: "scale(1.03)" } },
        }}
      >
        {image && (
          <Box
            component="img"
            src={image}
            alt=""
            loading="lazy"
            sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        )}
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          minHeight: { xs: "auto", md: fluid(s.minBody, Math.round(s.minBody * 0.55)) },
          bgcolor: "rgba(10, 8, 8, 0.86)",
          px: { xs: 2.5, md: fluid(s.padX, 18) },
          pt: { xs: 2, md: fluid(s.padTop, 12) },
          pb: { xs: 3, md: fluid(28, 18) },
        }}
      >
        <Typography sx={{ fontSize: { xs: 14, md: fluid(s.date, 13) }, lineHeight: 1.3 }}>{date}</Typography>
        <Typography
          component="h3"
          sx={{
            mt: fluid(featured ? 14 : 8, 6),
            fontSize: { xs: featured ? 26 : 19, md: fluid(s.title, featured ? 30 : 17) },
            fontWeight: 600,
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>
        {description && (
          <Typography
            sx={{
              mt: fluid(s.gap, 12),
              fontSize: { xs: 15, md: fluid(s.excerpt, 14) },
              lineHeight: 1.23,
              display: "-webkit-box",
              WebkitLineClamp: 4,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {description}
          </Typography>
        )}
      </Box>

      <RedBar label={buttonLabel} height={s.bar} fontSize={s.barText} />
    </SpaLink>
  );
}

export default NewsCard;
