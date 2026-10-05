import { useState, useEffect } from "react";
import { Box, Container, Grid, Typography, Divider } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useSearchParams } from "react-router-dom";
import ServicesCard from "../components/services/ServicesCard";
import { FadeScroll } from "../components/ui/FadeScroll";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchPortfolioItems,
  fetchPortfolioCategories,
} from "../services/wpApi";
import SectionHeading from "../components/ui/SectionHeading";
import InfiniteImageScroll from "../components/ui/InfiniteImageScroll";
import { useSection } from "../hooks/useSiteData";

const ALL = { id: null, slug: "", name: "All", description: "" };

// ─── COMPONENT ──────────────────────────────────────────────────────
export default function Services() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const { heading, intro, brands = {} } = useSection("services");

  // The active category lives in the URL (?category=<slug>) so the Home
  // service cards can deep-link to it.
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSlug = searchParams.get("category") || "";

  const [categories, setCategories] = useState([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories (wp-admin → Portfolios → Categories) on mount
  useEffect(() => {
    fetchPortfolioCategories()
      .then((wpCats) => setCategories(wpCats))
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoaded(true));
  }, []);

  // An unknown slug falls back to "All".
  const activeCategory =
    categories.find((cat) => cat.slug === activeSlug) || ALL;
  const filters = [ALL, ...categories];

  // Fetch portfolio items when the category changes
  useEffect(() => {
    if (!categoriesLoaded) return;
    setLoading(true);
    fetchPortfolioItems(activeCategory.id)
      .then((items) => setFilteredItems(items))
      .catch(() => setFilteredItems([]))
      .finally(() => setLoading(false));
  }, [categoriesLoaded, activeCategory.id]);

  const selectCategory = (cat) => {
    setSearchParams(cat.slug ? { category: cat.slug } : {}, { replace: true });
  };

  const description = activeCategory.slug ? activeCategory.description : intro;

  return (
    <>
      <Container maxWidth="xxl" sx={{ pt: { xs: 4, md: 6 } }}>
        <SectionHeading title={heading} color="text.secondary" sx={{ mt: 10, mb: 0 }} />
      </Container>
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* Filter                                                        */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Container maxWidth="xxl" sx={{ pt: { xs: 4, md: 6 } }}>
        <Box
          display="flex"
          flexWrap={"wrap"}
          alignItems="center"
          gap={1}
          rowGap={1}
          pl={{ xs: 0, md: 3 }}
          sx={{
            overflowX: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {filters.map((cat) => {
            const isActive = activeCategory.slug === cat.slug;
            return (
              <Box key={cat.slug || "all"} display="flex" alignItems="center">
                {/* Category button */}
                <motion.div
                  animate={{
                    backgroundColor: isActive
                      ? theme.palette.primary.main
                      : theme.palette.background.darkgray,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Box
                    onClick={() => selectCategory(cat)}
                    sx={{
                      cursor: "pointer",
                      px: 1.5,
                      py: 0.75,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.75,
                      borderRadius: "4px",
                    }}
                  >
                    {isActive ? (
                      <RemoveIcon
                        sx={{
                          fontSize: "1.2rem",
                          color: "white",
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <AddIcon
                        sx={{
                          fontSize: "1.2rem",
                          color: theme.palette.primary.main,
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <Typography
                      variant="bodyMedium"
                      component="span"
                      sx={{
                        fontWeight: 700,
                        textTransform: "uppercase",
                        userSelect: "none",
                        color: "white",
                        whiteSpace: "nowrap",
                        fontSize: "0.85rem",
                      }}
                    >
                      {cat.name}
                    </Typography>
                  </Box>
                </motion.div>
              </Box>
            );
          })}
        </Box>

        <Divider sx={{ mt: 4, mb: 2, borderBottomWidth: 2 }} />

        {/* "All" shows the Site Content intro; a category shows its own
            Description (wp-admin → Portfolios → Categories). */}
        <Typography>{description}</Typography>
      </Container>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* Section A — Portfolios                                        */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Container maxWidth="xxl" sx={{ py: { xs: 4, md: 6 }, mb: 10 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory.slug || "all"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Grid container spacing={4}>
              {loading ? (
                <Grid size={12}>
                  <Typography
                    variant="bodyMedium"
                    color="text.secondary"
                    py={4}
                  >
                    Loading portfolios...
                  </Typography>
                </Grid>
              ) : filteredItems.length === 0 ? (
                <Grid size={12}>
                  <Typography
                    variant="bodyMedium"
                    color="text.secondary"
                    py={4}
                  >
                    No portfolios found.
                  </Typography>
                </Grid>
              ) : (
                filteredItems.map((item, i) => (
                  <Grid
                    size={{ xs: 12, sm: 6, md: 4 }}
                    key={item.id}
                    sx={{ mb: 1 }}
                  >
                    <FadeScroll
                      delay={(i % (isMobile ? 1 : isTablet ? 2 : 3)) * 0.1}
                    >
                      <ServicesCard
                        title={item.title}
                        image={item.coverImage}
                        slug={item.slug}
                        description={item.description}
                        index={i}
                      />
                    </FadeScroll>
                  </Grid>
                ))
              )}
            </Grid>
          </motion.div>
        </AnimatePresence>
      </Container>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* Section B — Powering Leading Brands                             */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Box sx={{ bgcolor: "primary.main" }}>
        <Container
          maxWidth="xxl"
          sx={{
            py: { xs: 6, md: 10 },
            bgcolor: "primary.main",
          }}
        >
          <Typography
            variant="headingMedium"
            color="common.white"
            textAlign="center"
            display={"block"}
          >
            {brands.heading}
          </Typography>
          <Typography
            mt={6}
            variant="bodyLarge"
            color="common.white"
            textAlign="center"
            display={"block"}
            justifySelf={"center"}
            maxWidth={800}
          >
            {brands.body}
          </Typography>
          <Box mt={6} />
          <InfiniteImageScroll
            // The Embla loop needs enough slides to fill wide screens, so
            // the logo list is shown twice (OLD hard-coded it twice).
            images={[...(brands.logos || []), ...(brands.logos || [])]}
            height="100px"
            speed={2}
            spacing="4em"
            draggable={false}
          />
        </Container>
      </Box>
    </>
  );
}
