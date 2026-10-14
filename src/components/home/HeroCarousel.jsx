import { useCallback, useEffect, useRef, useState } from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import Chevron from "../ui/Chevron";
import { EDGE, fluid } from "../../utils/design";

const INTERVAL = 6000;

/**
 * Home hero (New Design.pdf): full-bleed photo, uppercase heading bottom
 * right, a line per slide (current one red), thin side chevrons and a
 * "scroll down" chevron. Advances every 6 s; any manual move restarts the
 * timer. With a single slide the controls disappear.
 */
function HeroCarousel({ slides = [], onScrollDown }) {
  const [index, setIndex] = useState(0);
  const timer = useRef(null);
  const count = slides.length;

  const restart = useCallback(() => {
    clearInterval(timer.current);
    if (count > 1) {
      timer.current = setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL);
    }
  }, [count]);

  useEffect(() => {
    restart();
    return () => clearInterval(timer.current);
  }, [restart]);

  const go = (next) => {
    setIndex((next + count) % count);
    restart();
  };

  const slide = slides[Math.min(index, count - 1)] || {};

  return (
    <Box
      component="section"
      aria-roledescription="carousel"
      sx={{
        position: "relative",
        height: { xs: "100svh", md: "min(100svh, 56.25vw)" },
        minHeight: { xs: 560, md: 600 },
        overflow: "hidden",
        bgcolor: "#111",
      }}
    >
      <AnimatePresence initial={false}>
        <motion.img
          key={index}
          src={slide.image}
          alt=""
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AnimatePresence>

      {/* Keeps the white heading readable on any photo. */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 45%)",
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          left: { xs: EDGE.xs, sm: EDGE.sm, md: "42.24%" },
          right: EDGE,
          bottom: { xs: 150, md: fluid(190, 110) },
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              component={index === 0 ? "h1" : "p"}
              sx={{
                color: "common.white",
                fontSize: { xs: 30, md: fluid(54, 32) },
                fontWeight: 700,
                lineHeight: 1.03,
                // The browser's Montserrat Bold sets ~4% wider than the
                // designer's; this keeps the PDF's line breaks.
                letterSpacing: "-0.025em",
                // The line breaks typed in wp-admin are for the desktop
                // layout; phones wrap the heading naturally.
                whiteSpace: { xs: "normal", md: "pre-line" },
                textTransform: "uppercase",
                maxWidth: { md: fluid(1030, 560) },
                textShadow: "0 2px 18px rgba(0,0,0,0.25)",
              }}
            >
              {slide.heading}
            </Typography>
          </motion.div>
        </AnimatePresence>
      </Box>

      {count > 1 && (
        <>
          {/* 30 px under the design's position, so a long last heading
              line edited in wp-admin can never run underneath. */}
          <Box
            role="tablist"
            aria-label="Slides"
            sx={{
              position: "absolute",
              right: EDGE,
              bottom: { xs: 120, md: fluid(158, 84) },
              display: "flex",
              gap: fluid(7, 5),
            }}
          >
            {slides.map((s, i) => (
              <ButtonBase
                key={i}
                role="tab"
                aria-selected={i === index}
                aria-label={`Slide ${i + 1}`}
                onClick={() => go(i)}
                sx={{ py: 1, width: { xs: 44, md: fluid(76, 48) } }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: { xs: 3, md: fluid(4, 3) },
                    bgcolor: i === index ? "primary.main" : "rgba(255,255,255,0.85)",
                    transition: "background-color .3s ease",
                  }}
                />
              </ButtonBase>
            ))}
          </Box>

          {[
            { dir: "left", label: "Previous slide", side: { left: { xs: 8, md: fluid(52, 20) } }, to: index - 1 },
            { dir: "right", label: "Next slide", side: { right: { xs: 8, md: fluid(30, 12) } }, to: index + 1 },
          ].map((a) => (
            <ButtonBase
              key={a.dir}
              onClick={() => go(a.to)}
              aria-label={a.label}
              sx={{
                // Phones: the slide lines below the heading are the controls.
                display: { xs: "none", md: "flex" },
                position: "absolute",
                top: "50%",
                transform: "translateY(-50%)",
                ...a.side,
                p: 1,
                color: "rgba(255,255,255,0.85)",
                "&:hover": { color: "common.white" },
              }}
            >
              <Chevron direction={a.dir} size={{ xs: 44, md: fluid(70, 46) }} strokeWidth={3} />
            </ButtonBase>
          ))}
        </>
      )}

      {onScrollDown && (
        <ButtonBase
          onClick={onScrollDown}
          aria-label="Scroll down"
          sx={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            bottom: { xs: 24, md: fluid(44, 20) },
            p: 1,
            color: "common.white",
          }}
        >
          <Chevron direction="down" size={{ xs: 52, md: fluid(70, 50) }} strokeWidth={4} />
        </ButtonBase>
      )}
    </Box>
  );
}

export default HeroCarousel;
