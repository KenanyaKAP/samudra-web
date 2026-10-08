import { useEffect, useState } from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { fetchPortfolioCategories, fetchPortfolioItems } from "../services/wpApi";
import { useSection } from "../hooks/useSiteData";
import { block, fluid, WIDE } from "../utils/design";
import PageHeading from "../components/ui/PageHeading";
import ServiceCard from "../components/ui/ServiceCard";
import InfiniteImageScroll from "../components/ui/InfiniteImageScroll";

const ALL = { id: null, slug: "", name: "", description: "" };

/** Filter chip: dark with a red "+", or red with a white "−" when active. */
function FilterChip({ label, active, onClick }) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-pressed={active}
      sx={{
        height: { xs: 48, md: fluid(79, 52) },
        pl: { xs: 1.5, md: fluid(16, 12) },
        pr: { xs: 2, md: fluid(22, 14) },
        gap: { xs: 1.5, md: fluid(16, 10) },
        bgcolor: active ? "primary.main" : "brand.charcoal",
        color: "common.white",
        transition: "background-color .3s ease",
        "&:hover": { bgcolor: active ? "primary.main" : "#454343" },
      }}
    >
      <Box
        component="span"
        aria-hidden="true"
        sx={{
          width: { xs: 18, md: fluid(28, 18) },
          color: active ? "common.white" : "primary.main",
          fontSize: { xs: 30, md: fluid(50, 30) },
          fontWeight: 600,
          lineHeight: 1,
          mt: "-0.12em",
        }}
      >
        {active ? "−" : "+"}
      </Box>
      <Typography component="span" sx={{ fontSize: { xs: 15, md: fluid(25, 15) }, fontWeight: 600, letterSpacing: "-0.01em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
        {label}
      </Typography>
    </ButtonBase>
  );
}

export default function Services() {
  const { heading, allLabel, intro, buttonLabel, emptyText, brands = {} } = useSection("services");

  // The active category lives in the URL (?category=<slug>) so the Home
  // service cards can deep-link to it.
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSlug = searchParams.get("category") || "";

  const [categories, setCategories] = useState([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Services - Samudra";
    fetchPortfolioCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoaded(true));
  }, []);

  // An unknown slug falls back to "All".
  const activeCategory = categories.find((cat) => cat.slug === activeSlug) || ALL;
  const filters = [{ ...ALL, name: allLabel }, ...categories];

  useEffect(() => {
    if (!categoriesLoaded) return;
    setLoading(true);
    fetchPortfolioItems(activeCategory.id)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [categoriesLoaded, activeCategory.id]);

  const selectCategory = (cat) => {
    setSearchParams(cat.slug ? { category: cat.slug } : {}, { replace: true });
  };

  // "All" shows the Site Content intro; a category shows its own Description
  // (wp-admin → Portfolios → Categories).
  const description = activeCategory.slug ? activeCategory.description : intro;

  return (
    <>
      <Box sx={{ bgcolor: "common.white", color: "brand.ink", pb: { xs: 8, md: fluid(54, 40) } }}>
        <Box sx={{ ...block(WIDE), pt: { xs: 14, md: fluid(203, 150) } }}>
          <PageHeading size={55} color="brand.ink">
            {heading}
          </PageHeading>

          <Box sx={{ pl: { md: fluid(70, 0) }, pr: { md: fluid(22, 0) } }}>
            <Box
              role="group"
              aria-label="Filter projects by service"
              sx={{ mt: { xs: 5, md: fluid(98, 48) }, display: "flex", flexWrap: "wrap", gap: { xs: 1, md: fluid(12, 8) } }}
            >
              {filters.map((cat) => (
                <FilterChip
                  key={cat.slug || "all"}
                  label={cat.name}
                  active={activeCategory.slug === cat.slug}
                  onClick={() => selectCategory(cat)}
                />
              ))}
            </Box>

            <Box sx={{ mt: { xs: 4, md: fluid(48, 28) }, ml: { md: `calc(-1 * ${fluid(8, 0)})` }, borderTop: "1px solid", borderColor: "brand.ink" }} />

            <Typography sx={{ mt: { xs: 3, md: fluid(34, 20) }, fontSize: { xs: 16, md: fluid(24, 16) }, lineHeight: 1.2, minHeight: { md: "3.6em" } }}>
              {description}
            </Typography>
          </Box>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory.slug || "all"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <Box
                sx={{
                  mt: { xs: 5, md: fluid(44, 32) },
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" },
                  columnGap: { xs: 3, md: fluid(32, 18) },
                  rowGap: { xs: 4, md: fluid(61, 32) },
                  minHeight: 200,
                }}
              >
                {!loading && items.length === 0 && (
                  <Typography sx={{ gridColumn: "1 / -1", color: "text.secondary", py: 4 }}>{emptyText}</Typography>
                )}
                {items.map((item) => (
                  <ServiceCard
                    key={item.id}
                    to={`/services/${item.slug}`}
                    image={item.coverImage}
                    title={item.title}
                    description={item.description}
                    buttonLabel={buttonLabel}
                    variant="grey"
                  />
                ))}
              </Box>
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>

      {/* ── Powering Leading Brands ─────────────────────────────── */}
      <Box component="section" sx={{ bgcolor: "primary.main", color: "common.white", textAlign: "center" }}>
        <Box sx={{ ...block(WIDE), pt: { xs: 8, md: fluid(64, 48) }, pb: { xs: 8, md: fluid(150, 64) } }}>
          <Typography component="h2" sx={{ fontSize: { xs: 26, md: fluid(36, 24) }, fontWeight: 700 }}>
            {brands.heading}
          </Typography>
          <Typography sx={{ mt: { xs: 3, md: fluid(30, 20) }, mx: "auto", maxWidth: { md: fluid(860, 560) }, fontSize: { xs: 16, md: fluid(21, 15) }, lineHeight: 1.2 }}>
            {brands.body}
          </Typography>
          <Box sx={{ mt: { xs: 5, md: fluid(64, 40) } }}>
            <InfiniteImageScroll
              // The Embla loop needs enough slides to fill wide screens, so
              // the logo list is shown twice.
              images={[...(brands.logos || []), ...(brands.logos || [])]}
              height={fluid(92, 60)}
              balance
              speed={1.2}
              spacing={fluid(80, 36)}
              draggable={false}
            />
          </Box>
        </Box>
      </Box>
    </>
  );
}
