import { Box, Typography } from "@mui/material";

/**
 * Small card for the "More Release" sidebar.
 * Shows image, title, and date.
 */
export default function MoreReleaseCard({ event, onClick }) {
  const placeholderColors = ["#78909C", "#90A4AE", "#607D8B"];
  const bgColor = placeholderColors[event.id % placeholderColors.length];

  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: "pointer",
        "&:hover img": { transform: "scale(1.03)" },
      }}
    >
      {/* Image */}
      <Box
        sx={{
          width: "100%",
          aspectRatio: "16/10",
          overflow: "hidden",
          borderRadius: "0 0 0 30px",
        }}
      >
        {event.coverImage ? (
          <Box
            component="img"
            src={event.coverImage}
            alt={event.title}
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

      {/* Title */}
      <Typography
        variant="bodyMedium"
        fontWeight={600}
        mt={1.5}
        sx={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          lineHeight: 1.4,
        }}
      >
        {event.title}
      </Typography>

      {/* Date */}
      <Typography
        variant="bodySmall"
        color="text.secondary"
        mt={0.5}
        display="block"
      >
        © {event.date}
      </Typography>
    </Box>
  );
}
