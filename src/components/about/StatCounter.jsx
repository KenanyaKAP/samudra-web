import { useRef, useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { motion, useInView } from "framer-motion";

/**
 * Animated stat counter that counts up when scrolled into view
 *
 * @example
 * <StatCounter value={500} suffix="+" label="Projects Completed" />
 * <StatCounter value={20} suffix="+" label="Years Experience" />
 */
function StatCounter({
  value = 0,
  suffix = "+",
  label = "Label",
  color = "primary.main",
  duration = 2,
  delay = 0,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let startTime;
    let animationFrame;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime + delay * 1000;
      const elapsed = (currentTime - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      // Ease in
      // const eased = Math.pow(progress, 3);

      setCount(Math.max(Math.floor(eased * value), 0));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, value, duration, delay]);

  return (
    <Box ref={ref} textAlign="left">
      <Typography
        display={"block"}
        variant="bodySmall"
        color="text.secondary"
        textTransform={"uppercase"}
        fontWeight={700}
        mt={0.5}
      >
        {label}
      </Typography>
      <Typography display={"block"} variant="statNumber" color={color}>
        {count}
        {suffix}
      </Typography>
    </Box>
  );
}

export default StatCounter;
