import { useState, useEffect } from "react";
import { Box, Container, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import { FadeScroll } from "../components/ui/FadeScroll";
import PortfolioGalleryViewer from "../components/services/PortfolioGalleryViewer";
import HighlightedProjects from "../components/services/HighlightedProjects";
import {
  fetchPortfolioBySlug,
  fetchHighlightedProjects,
} from "../services/wpApi";

/**
 * Portfolio Detail Page
 *
 * Layout (matches the provided design):
 * ┌──────────────────────────────────────────────────────────┐
 * │ ┌────────────────────────┬─────┐                        │
 * │ │     HERO IMAGE         │thumb│                        │  Gallery
 * │ │                        │thumb│                        │
 * │ │                        │thumb│                        │
 * │ └────────────────────────┴─────┘                        │
 * ├──────────────────────────────────────────────────────────┤
 * │ Title / Category / Description                          │  Header
 * ├──────────────────────────────────────────────────────────┤
 * │ Highlighted Project                                     │
 * │ [card] [card] [card] [card] [card] →                    │  Related
 * └──────────────────────────────────────────────────────────┘
 *
 * Data: wp-admin → Portfolios. "Highlighted Project" lists the latest
 * portfolios of the same category.
 */
export default function PortfolioDetail() {
  const { slug } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [highlightedProjects, setHighlightedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch portfolio data
  useEffect(() => {
    setLoading(true);
    fetchPortfolioBySlug(slug)
      .then((data) => setPortfolio(data))
      .catch(() => setPortfolio(null))
      .finally(() => setLoading(false));
  }, [slug]);

  // Fetch highlighted projects when portfolio loads
  useEffect(() => {
    if (!portfolio) return;
    fetchHighlightedProjects(portfolio.categoryId, portfolio.id, 6)
      .then((items) => setHighlightedProjects(items))
      .catch(() => setHighlightedProjects([]));
  }, [portfolio]);

  if (loading) {
    return (
      <Container maxWidth="xxl" sx={{ pt: 20, pb: 10 }}>
        <Typography variant="bodyMedium" color="text.secondary">
          Loading...
        </Typography>
      </Container>
    );
  }

  if (!portfolio) {
    return (
      <Container maxWidth="xxl" sx={{ pt: 20, pb: 10 }}>
        <Typography variant="headingMedium">Portfolio not found</Typography>
        <Typography variant="bodyMedium" color="text.secondary" mt={2}>
          The portfolio item you're looking for doesn't exist.
        </Typography>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="xxl" sx={{ pt: { xs: 12, md: 14 } }}>
        {/* ═══════════════════════════════════════════════════════════ */}
        {/* Gallery Viewer — Hero + Thumbnails                        */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <Box mt={{ xs: 2, md: 3 }}>
          <FadeScroll delay={0.05}>
            <PortfolioGalleryViewer
              heroImage={portfolio.heroImage}
              galleryImages={portfolio.galleryImages}
            />
          </FadeScroll>
        </Box>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* Title, Category, Description                              */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <Box mt={{ xs: 3, md: 5 }}>
          <FadeScroll delay={0.1}>
            <Typography variant="headingLarge" component="h1" sx={{ maxWidth: "800px" }}>
              {portfolio.title}
            </Typography>
          </FadeScroll>

          <FadeScroll delay={0.15}>
            <Typography
              variant="headingSmall"
              color="primary.main"
              fontWeight={600}
              mt={1}
              display="block"
            >
              {portfolio.category}
            </Typography>
          </FadeScroll>

          <Box sx={{ mt: 6 }}>
            <FadeScroll delay={0.2}>
              <Typography
                variant="bodyMedium"
                color="text.secondary"
                mt={2}
                sx={{
                  lineHeight: 1.8,
                  whiteSpace: "pre-line",
                  wordBreak: "break-word",
                }}
              >
                {portfolio.description}
              </Typography>
            </FadeScroll>
          </Box>
        </Box>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* Highlighted Projects                                      */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <Box mt={{ xs: 8, md: 12 }} mb={{ xs: 6, md: 10 }}>
          <HighlightedProjects
            projects={highlightedProjects}
            title="Highlighted Project"
          />
        </Box>
      </Container>
    </>
  );
}
