import { useEffect, useState } from "react";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { fetchEventItems } from "../services/wpApi";
import { useSection } from "../hooks/useSiteData";
import { cssUrl } from "../utils/cssUrl";
import { block, fluid, WIDE } from "../utils/design";
import PageHeading from "../components/ui/PageHeading";
import NewsCard from "../components/ui/NewsCard";

// The PDF's background: the photo in black and white under a dark-to-red
// gradient set to Multiply, so the photo shows through most where it is
// lightest. The stops are the gradient as the PDF renders it (rich black to
// the brand red, slightly eased). Without a photo the wash alone is shown.
const WASH =
  "linear-gradient(180deg, #110F0D 0%, #261917 20%, #49221F 40%, #6B2724 55%, #952A29 70%, #C3282A 85%, #EA2027 100%)";

const GAP = fluid(38, 20);

/**
 * /events — newest post as a large lead card, the next two stacked beside
 * it, everything else three across (New Design.pdf).
 */
function Events() {
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up("md"));
  const { heading, backgroundImage, buttonLabel, emptyText } = useSection("news");
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    document.title = "News & Event - Samudra";
    fetchEventItems()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoaded(true));
  }, []);

  const card = (news, size = "regular") => (
    <NewsCard
      key={news.id}
      to={`/events/${news.slug}`}
      image={news.coverImage}
      date={news.date}
      title={news.title}
      description={news.description}
      buttonLabel={buttonLabel}
      size={size}
    />
  );

  const [lead, ...others] = items;
  const side = desktop ? others.slice(0, 2) : [];
  const rest = desktop ? others.slice(2) : others;

  return (
    <Box
      sx={{
        position: "relative",
        isolation: "isolate",
        background: WASH,
        color: "common.white",
        minHeight: "100vh",
        ...(backgroundImage && {
          "&::before, &::after": { content: '""', position: "absolute", inset: 0, zIndex: -1 },
          "&::before": { background: `${cssUrl(backgroundImage)} center top / cover no-repeat`, filter: "grayscale(1)" },
          "&::after": { background: WASH, mixBlendMode: "multiply" },
        }),
      }}
    >
      <Box sx={{ ...block(WIDE), pt: { xs: 14, md: fluid(220, 150) }, pb: { xs: 8, md: fluid(82, 60) } }}>
        <PageHeading size={55}>{heading}</PageHeading>

        {loaded && !items.length && <Typography sx={{ mt: 6, opacity: 0.8 }}>{emptyText}</Typography>}

        {lead && (
          <Box
            sx={{
              mt: { xs: 5, md: fluid(120, 60) },
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: side.length ? "1018fr 492fr" : "1fr" },
              gap: GAP,
            }}
          >
            {card(lead, desktop ? "featured" : "regular")}
            {side.length > 0 && (
              <Box sx={{ display: "grid", gridTemplateRows: `repeat(${side.length}, 1fr)`, gap: fluid(31, 20) }}>
                {side.map((news) => card(news))}
              </Box>
            )}
          </Box>
        )}

        {rest.length > 0 && (
          <Box
            sx={{
              mt: { xs: 4, md: fluid(51, 32) },
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
              columnGap: GAP,
              rowGap: { xs: 4, md: fluid(47, 28) },
            }}
          >
            {rest.map((news) => card(news))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Events;
