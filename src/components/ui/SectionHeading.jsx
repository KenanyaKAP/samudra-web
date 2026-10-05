import { Typography, Box } from "@mui/material";
import { FadeScroll } from "./FadeScroll";

/**
 * Reusable section heading with optional subtitle
 * Wraps in FadeScroll for scroll animations
 *
 * @example
 * <SectionHeading title="Our Service" />
 * <SectionHeading title="Latest News" subtitle="Stay updated" align="center" />
 * <SectionHeading title="About" color="text.light" />
 */
function SectionHeading({
  title,
  subtitle,
  align = "left",
  color = "text.primary",
  subtitleColor = "text.secondary",
  delay = 0,
  sx = {},
}) {
  return (
    <FadeScroll delay={delay}>
      <Box sx={{ textAlign: align, ...sx }}>
        <Typography variant="headingLarge" color={color} sx={{
          textTransform: "uppercase",
        }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="bodyLarge" color={subtitleColor} mt={1.5}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </FadeScroll>
  );
}

export default SectionHeading;
