import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Box } from "@mui/material";

/**
 * A wrapper component that fades in elements when they scroll into view
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child elements to animate
 * @param {number} props.delay - Delay before animation starts (in seconds)
 * @param {number} props.duration - Animation duration (in seconds)
 * @param {number} props.yOffset - Vertical offset for slide animation (in pixels)
 * @param {number} props.blurAmount - Initial blur amount in pixels (default: 10)
 * @param {Object} props.sx - Custom styles object to apply to the wrapper
 * @param {boolean} props.disabled - Disable animation and render children directly (default: false)
 */
// Set this to true to disable all FadeScroll animations globally
const FADE_SCROLL_DISABLED = true;

export const FadeScroll = ({
  children,
  delay = 0,
  duration = 0.6,
  yOffset = 50,
  blurAmount = 10,
  once = true,
  sx = {},
  margin = "-50px",
  disabled = FADE_SCROLL_DISABLED,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: once, // Only animate once
    margin: margin, // Trigger animation 100px before element enters viewport
  });

  // If disabled, just render children without animation
  if (disabled) {
    return <Box sx={sx}>{children}</Box>;
  }

  return (
    <Box sx={sx}>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: yOffset, filter: `blur(${blurAmount}px)` }}
        animate={
          isInView
            ? { opacity: 1, y: 0, filter: "blur(0px)" }
            : { opacity: 0, y: yOffset, filter: `blur(${blurAmount}px)` }
        }
        transition={{
          duration: duration + 0.1,
          delay: delay,
          ease: "easeOut",
        }}
      >
        {children}
      </motion.div>
    </Box>
  );
};

export default FadeScroll;
