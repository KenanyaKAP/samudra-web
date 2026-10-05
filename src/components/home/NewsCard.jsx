import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";

/**
 * News card for the "Latest News" section
 *
 * @example
 * <NewsCard
 *   title="Samudra Wins Best Booth Award"
 *   date="December 15, 2025"
 *   image="/images/news1.jpg"
 * />
 */
function NewsCard({ title, date, description, image, index = 0, onClick }) {
  const placeholderColors = ["#78909C", "#90A4AE", "#607D8B", "#B0BEC5"];
  const bgColor = placeholderColors[index % placeholderColors.length];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <Box
        onClick={onClick}
        sx={{
          overflow: "hidden",
          bgcolor: "rgba(0, 0, 0, 0.72)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          cursor: onClick ? "pointer" : "default",
          height: "100%",
          p: 2,
          display: "flex",
          flexDirection: "column",
          "&:hover img": {
            transform: "scale(1.05)",
          },
        }}
      >
        {/* Image */}
        <Box
          sx={{
            width: "100%",
            aspectRatio: "3/2",
            overflow: "hidden",
            bgcolor: "rgba(255,255,255,0.08)",
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

        {/* Text */}
        <Box pt={2} sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
          {date && (
            <Typography
              display={"block"}
              variant="bodySmall"
              color="text.light"
              sx={{ opacity: 0.9 }}
              mb={1}
            >
              {date}
            </Typography>
          )}

          <Typography
            display={"block"}
            variant="headingSmall"
            color="text.light"
            fontWeight={700}
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {title || "News headline"}
          </Typography>

          <Typography
            variant="bodyMedium"
            color="text.light"
            mt={1.5}
            sx={{
              opacity: 0.9,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {description || "No description available."}
          </Typography>

          <Box mt={2} display={"flex"} justifyContent={"flex-end"}>
            <Typography variant="bodySmall" fontWeight={700} color="text.light">
              READ MORE -&gt;
            </Typography>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
}

export default NewsCard;
