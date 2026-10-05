import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigation } from "../../hooks/useNavigation";

/**
 * Portfolio card for the portfolio listing page.
 * Clicking navigates to the portfolio detail page.
 *
 * @example
 * <ServicesCard
 *   title="Samudra Wins Best Booth Award"
 *   image="/images/news1.jpg"
 *   slug="samudra-wins-best-booth"
 *   description="Event description..."
 * />
 */
function ServicesCard({ title, image, slug, description, index = 0 }) {
  const { navigateWithFade } = useNavigation();
  const placeholderColors = ["red", "#90A4AE", "#607D8B", "#B0BEC5"];
  const bgColor = placeholderColors[index % placeholderColors.length];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <Box
        onClick={() => slug && navigateWithFade(`/services/${slug}`)}
        sx={{
          cursor: "pointer",
          height: "100%",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          "&:hover img": {
            transform: "scale(1.05)",
          },
          bgcolor: "background.gray",
          color: "text.light",
          transition: "transform 0.3s ease",
          "&:hover": {
            bgcolor: "background.gray",
          },
        }}
      >
        {/* Image */}
        <Box
          sx={{
            width: "100%",
            aspectRatio: "16/11",
            overflow: "hidden",
          }}
        >
          {image ? (
            <Box
              component="img"
              src={image}
              alt={title}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                transition: "transform 0.4s ease",
              }}
            />
          ) : (
            <Box sx={{ width: "100%", height: "100%", bgcolor: bgColor }} />
          )}
        </Box>

        <Typography
          display={"block"}
          variant="bodyMedium"
          fontWeight={600}
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            color: "text.light",
          }}
        >
          {title || "News headline"}
        </Typography>

        {description && (
          <Typography
            display={"block"}
            variant="bodySmall"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              color: "text.light",
              mb: 4,
            }}
          >
            {description}
          </Typography>
        )}
      </Box>
    </motion.div>
  );
}

export default ServicesCard;
