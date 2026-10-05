import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigation } from "../../hooks/useNavigation";

/**
 * News card for the "Latest News" section
 *
 * @example
 * <EventCard
 *   title="Samudra Wins Best Booth Award"
 *   date="December 15, 2025"
 *   image="/images/news1.jpg"
 *   slug="samudra-wins-best-booth"
 * />
 */
function EventCard({
  title,
  date = "January 25, 2025",
  description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  image,
  slug,
  index = 0,
  // isActive = false,
}) {
  const placeholderColors = ["#78909C", "#90A4AE", "#607D8B", "#B0BEC5"];
  const bgColor = placeholderColors[index % placeholderColors.length];
  const { navigateWithFade } = useNavigation();

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <Box
        onClick={() => slug && navigateWithFade(`/events/${slug}`)}
        sx={{
          cursor: "pointer",
          height: "100%",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          bgcolor: "background.gray",
          color: "text.light",
          transition: "transform 0.3s ease",
          "&:hover img": {
            transform: "scale(1.05)",
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

        {date && (
          <Typography
            mt={1}
            display={"block"}
            variant="bodySmall"
            color="text.light"
            fontWeight={600}
          >
            {date}
          </Typography>
        )}

        <Typography
          display={"block"}
          variant="headingMedium"
          fontWeight={700}
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            lineHeight: 1.2,
            overflow: "hidden",
            color: "text.light",
            mt: 0.5,
          }}
        >
          {title || "News headline"}
        </Typography>

        {description && (
          <Typography
            display={"block"}
            variant="bodySmall"
            fontWeight={500}
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.4,
              color: "text.light",
              mt: 1,
            }}
          >
            {description}
          </Typography>
        )}

        <Box display="flex" justifyContent="flex-end" mt="auto" pt={2}>
          <Typography variant="bodyMedium" fontWeight={700} color="text.light">
            READ MORE -&gt;
          </Typography>
        </Box>
      </Box>
    </motion.div>
  );
}

export default EventCard;
