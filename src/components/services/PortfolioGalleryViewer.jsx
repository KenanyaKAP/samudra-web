import { useState } from "react";
import { Box } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

/**
 * Gallery viewer with a large hero image and scrollable thumbnails on the right.
 * Clicking a thumbnail swaps it into the hero area with a crossfade animation.
 *
 * Layout:
 * ┌──────────────────────┬──────┐
 * │                      │ img1 │
 * │     HERO IMAGE       │ img2 │
 * │                      │ img3 │
 * │                      │ img4 │
 * └──────────────────────┴──────┘
 *
 * On mobile, thumbnails stack horizontally below the hero.
 *
 * @param {Object} props
 * @param {string} props.heroImage - Initial large hero image URL
 * @param {string[]} props.galleryImages - Array of thumbnail image URLs
 */
function PortfolioGalleryViewer({ heroImage, galleryImages = [] }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // All images: hero first, then gallery
  const allImages = [heroImage, ...galleryImages].filter(Boolean);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = allImages[activeIndex] || heroImage;

  if (allImages.length === 0) return null;

  return (
    <Box>
      {/* Desktop: side-by-side layout */}
      {!isMobile ? (
        <Box sx={{ position: "relative" }}>
          {/* Aspect-ratio wrapper — hero dictates the row height */}
          <Box sx={{ aspectRatio: "16/9", width: "100%" }}>
            <Box
              display="flex"
              gap={1.5}
              sx={{ position: "absolute", inset: 0 }}
            >
              {/* Hero image — large area */}
              <Box
                sx={{
                  flex: 1,
                  overflow: "hidden",
                  position: "relative",
                  bgcolor: "#E0E0E0",
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeIndex}
                    src={activeImage}
                    alt="Portfolio hero"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      position: "absolute",
                      top: 0,
                      left: 0,
                    }}
                  />
                </AnimatePresence>
              </Box>

              {/* Thumbnails — right column, scrollable within hero height */}
              {allImages.length > 1 && (
                <Box
                  sx={{
                    width: 260,
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    overflowY: "auto",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    "&::-webkit-scrollbar": { display: "none" },
                  }}
                >
                  {allImages.map((img, i) => (
                    <Box
                      key={i}
                      onClick={() => setActiveIndex(i)}
                      sx={{
                        width: "100%",
                        aspectRatio: "4/3",
                        overflow: "hidden",
                        cursor: "pointer",
                        border:
                          activeIndex === i
                            ? `2px solid ${theme.palette.primary.main}`
                            : "2px solid transparent",
                        opacity: activeIndex === i ? 1 : 0.7,
                        transition: "opacity 0.2s, border-color 0.2s",
                        "&:hover": {
                          opacity: 1,
                        },
                        flexShrink: 0,
                      }}
                    >
                      <Box
                        component="img"
                        src={img}
                        alt={`Gallery thumbnail ${i + 1}`}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      ) : (
        /* Mobile: stacked layout */
        <Box>
          {/* Hero image */}
          <Box
            sx={{
              width: "100%",
              aspectRatio: "16/9",
              overflow: "hidden",
              position: "relative",
              bgcolor: "#E0E0E0",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={activeIndex}
                src={activeImage}
                alt="Portfolio hero"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
              />
            </AnimatePresence>
          </Box>

          {/* Horizontal scrollable thumbnails */}
          {allImages.length > 1 && (
            <Box
              sx={{
                display: "flex",
                gap: 1,
                mt: 1.5,
                overflowX: "auto",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                "&::-webkit-scrollbar": { display: "none" },
                pb: 1,
              }}
            >
              {allImages.map((img, i) => (
                <Box
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  sx={{
                    width: 80,
                    height: 60,
                    flexShrink: 0,
                    overflow: "hidden",
                    cursor: "pointer",
                    border:
                      activeIndex === i
                        ? `2px solid ${theme.palette.primary.main}`
                        : "2px solid transparent",
                    opacity: activeIndex === i ? 1 : 0.7,
                    transition: "opacity 0.2s, border-color 0.2s",
                    "&:hover": {
                      opacity: 1,
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={img}
                    alt={`Gallery thumbnail ${i + 1}`}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

export default PortfolioGalleryViewer;
