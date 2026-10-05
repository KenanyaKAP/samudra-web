import { useState, useEffect, useRef } from "react";
import { Box, Typography, Container, Button } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ImageCarousel component with auto-play and fade transitions
 * @param {string[]} images - Array of image paths
 * @param {number} duration - Duration in milliseconds for each image (default: 5000)
 * @param {string} aspectRatio - Aspect ratio of the carousel (default: "auto")
 * @param {string|number} height - Height of the carousel (default: "auto")
 * @param {boolean} showDots - Whether to show pagination dots (default: true)
 * @param {boolean} enableClick - Whether clicking the carousel advances images (default: true)
 * @param {string} useAnimation - Animation type: "fade" for fade animation, "slide" for slide animation, "none" for no animation (default: "none")
 */
export function ImageCarousel({
  images = [],
  duration = 5000,
  aspectRatio = "auto",
  height = "auto",
  showDots = true,
  showText = true,
  dotsOffset = -20,
  enableClick = true,
  useAnimation = "none",
  useArrow = false,
  arrowSize = 40,
  gradientOverlay = false,
  dotsAlign = "center",
  buttonText = null,
  onButtonClick = null,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Auto-play functionality with reset on user navigation
  const intervalRef = useRef();
  const resetInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (images.length > 1) {
      intervalRef.current = setInterval(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, duration);
    }
  };

  useEffect(() => {
    resetInterval();
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length, duration]);

  const goToNext = () => {
    if (images.length <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
    resetInterval();
  };

  const goToPrevious = () => {
    if (images.length <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    resetInterval();
  };

  const goToSlide = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    resetInterval();
  };

  const handleClick = (e) => {
    if (!enableClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const midpoint = rect.width / 2;
    if (clickX < midpoint) {
      goToPrevious();
    } else {
      goToNext();
    }
  };

  if (!images || images.length === 0) {
    return (
      <Box
        sx={{
          width: "100%",
          height: height,
          aspectRatio: aspectRatio !== "auto" ? aspectRatio : undefined,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "grey.200",
          borderRadius: 2,
        }}
      >
        No images available
      </Box>
    );
  }

  // Animation variants
  const fadeVariants = {
    enter: {
      opacity: 0,
    },
    center: {
      opacity: 1,
    },
    exit: {
      opacity: 0,
    },
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const variants = useAnimation === "fade" ? fadeVariants : slideVariants;

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: height,
          aspectRatio: aspectRatio !== "auto" ? aspectRatio : undefined,
          overflow: "hidden",
          borderRadius: 0,
          cursor: enableClick ? "pointer" : "default",
        }}
        onClick={handleClick}
      >
        {/* Image Container with Animation */}
        {useAnimation !== "none" ? (
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                opacity: { duration: 0.5 },
                x: { type: "spring", stiffness: 300, damping: 30 },
              }}
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
              }}
            >
              <img
                src={images[currentIndex].image}
                alt={`Slide ${currentIndex + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          <img
            src={images[currentIndex].image}
            alt={`Slide ${currentIndex + 1}`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}

        {/* Gradient overlay */}
        {gradientOverlay && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 55%, transparent 100%)",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
        )}

        {/* Navigation Arrows */}
        {useArrow && images.length > 1 && (
          <>
            <Box
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              sx={{
                position: "absolute",
                top: "50%",
                left: 16,
                transform: "translateY(-50%)",
                color: "white",
                borderRadius: "50%",
                width: arrowSize,
                height: arrowSize,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.3s",
                zIndex: 2,
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.3)",
                },
              }}
            >
              <ChevronLeft sx={{ fontSize: arrowSize * 0.75 }} />
            </Box>
            <Box
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              sx={{
                position: "absolute",
                top: "50%",
                right: 16,
                transform: "translateY(-50%)",
                color: "white",
                borderRadius: "50%",
                width: arrowSize,
                height: arrowSize,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.3s",
                zIndex: 2,
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.3)",
                },
              }}
            >
              <ChevronRight sx={{ fontSize: arrowSize * 0.75 }} />
            </Box>
          </>
        )}
      </Box>

      {/* Pagination Dots - Outside carousel overflow */}
      {showDots && images.length > 1 && (
        <Box
          sx={{
            position: "absolute",
            bottom: 16 - dotsOffset,
            ...(dotsAlign === "right"
              ? { right: "5%" }
              : { left: "50%", transform: "translateX(-50%)" }),
            display: "flex",
            gap: 1,
            zIndex: 10,
          }}
        >
          {images.map((_, index) => (
            <Box
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                goToSlide(index);
              }}
              sx={{
                width: 60,
                height: 5,
                borderRadius: "1px",
                bgcolor:
                  index === currentIndex ? "primary.main" : "background.paper",
                cursor: "pointer",
                transition: "all 0.3s",
                "&:hover": {
                  bgcolor: "white",
                },
              }}
            />
          ))}
        </Box>
      )}

      {/* Text Overlay on carousel */}
      {showText && (
        <Container maxWidth="xxl">
          <Box
            sx={{
              position: "absolute",
              bottom: 16 - (showDots ? 3 * dotsOffset : 0),
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              zIndex: 3,
            }}
          >
            <Box>
              {images[currentIndex].heading && (
                <Typography
                  display={"block"}
                  variant="headingLarge"
                  maxWidth={"60%"}
                  color="text.light"
                  sx={{
                    fontSize: { xs: "2rem", md: "3.2rem" },
                    textShadow: "0 2px 10px rgba(0,0,0,0.3)",
                    pointerEvents: "none",
                  }}
                >
                  {images[currentIndex].heading}
                </Typography>
              )}
              {images[currentIndex].subtitle && (
                <Typography
                  display={"block"}
                  variant="bodyLarge"
                  maxWidth={"70%"}
                  color="text.light"
                  sx={{ opacity: 0.9, mt: 1, pointerEvents: "none" }}
                >
                  {images[currentIndex].subtitle}
                </Typography>
              )}
              {buttonText && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onButtonClick && onButtonClick();
                  }}
                  sx={{ mt: 2, alignSelf: "flex-start" }}
                >
                  {buttonText} &rarr;
                </Button>
              )}
            </Box>
          </Box>
        </Container>
      )}
    </Box>
  );
}

export default ImageCarousel;
