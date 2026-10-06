import { useEffect, useState } from "react";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { fetchEventItems } from "../services/wpApi";
import { useSection } from "../hooks/useSiteData";
import { cssUrl } from "../utils/cssUrl";
import { block, fluid } from "../utils/design";
import PageHeading from "../components/ui/PageHeading";
import NewsCard from "../components/ui/NewsCard";

// Until the designer's background photo is supplied (Site Content → News
// Page → Background Image), a dark-to-red wash in the colours of the PDF.
const PLACEHOLDER_BG = "linear-gradient(180deg, #120E0D 0%, #2A1110 38%, #7E1519 72%, #C41A21 100%)";

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
        background: backgroundImage ? `${cssUrl(backgroundImage)} center top / cover no-repeat, #120E0D` : PLACEHOLDER_BG,
        color: "common.white",
        minHeight: "100vh",
      }}
    >
      <Box sx={{ ...block(1551), pt: { xs: 14, md: fluid(220, 150) }, pb: { xs: 8, md: fluid(82, 60) } }}>
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
