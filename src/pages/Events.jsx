import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Link as MuiLink,
} from "@mui/material";
import EventCard from "../components/news/EventCard";
import { FadeScroll } from "../components/ui/FadeScroll";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { motion, AnimatePresence } from "framer-motion";
import { fetchEventItems } from "../services/wpApi.js";
import { useSection } from "../hooks/useSiteData";
import SectionHeading from "../components/ui/SectionHeading";

// ─── COMPONENT ──────────────────────────────────────────────────────
export default function Events() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const { heading } = useSection("news");

  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all events (wp-admin → News)
  useEffect(() => {
    setLoading(true);
    fetchEventItems()
      .then((items) => setFilteredItems(items))
      .catch(() => setFilteredItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Container maxWidth="xxl" sx={{ pt: { xs: 4, md: 6 } }}>
        <SectionHeading title={heading} color="text.secondary" sx={{ mt: 10, mb: 0 }} />
      </Container>
      
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* Section B — Latest News Release                                        */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Container maxWidth="xxl" sx={{ py: { xs: 4, md: 6 } }}>
        {/* <Typography variant="headingMedium" display={"block"} mb={3}>
          Latest News Release
        </Typography> */}

        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {loading ? (
              <Typography variant="bodyMedium" color="text.secondary">
                Loading...
              </Typography>
            ) : filteredItems.length === 0 ? (
              <Typography variant="bodyMedium" color="text.secondary">
                No events found.
              </Typography>
            ) : (
              <Grid container spacing={4}>
                {filteredItems.map((item, i) => (
                  <Grid
                    size={{ xs: 12, sm: 6, md: 6 }}
                    key={item.id}
                    sx={{ mb: 2 }}
                  >
                    <FadeScroll
                      delay={(i % (isMobile ? 2 : isTablet ? 3 : 4)) * 0.1}
                    >
                      <EventCard
                        title={item.title}
                        image={item.coverImage}
                        date={item.date}
                        description={item.description}
                        slug={item.slug}
                        index={i}
                      />
                    </FadeScroll>
                  </Grid>
                ))}
              </Grid>
            )}
          </motion.div>
        </AnimatePresence>
      </Container>
    </>
  );
}
