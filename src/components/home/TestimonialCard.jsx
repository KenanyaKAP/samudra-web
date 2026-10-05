import { Box, Typography } from "@mui/material";

export default function TestimonialCard({ image, title, location, text }) {
  return (
    <Box
      sx={{
        bgcolor: "white",
        p: 6,
        borderRadius: 10,
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Quote Mark in top right */}
      <Typography
        sx={{
          position: "absolute",
          top: 16,
          right: 20,
          fontSize: "3rem",
          color: "primary.main",
          lineHeight: 1,
          opacity: 0.8,
        }}
      >
        "
      </Typography>

      {/* Profile Image & Info */}
      <Box
        sx={{
          display: "flex",
          gap: 4,
          alignItems: "flex-start",
        }}
      >
        {/* Profile Image */}
        <Box
          component="img"
          src={image}
          alt={title}
          sx={{
            width: 200,
            height: 200,
            borderRadius: "50%",
            objectFit: "cover",
            flexShrink: 0,
            alignSelf: "center",
          }}
        />

        {/* Name & Location */}
        <Box sx={{ alignSelf: "center" }}>
          <Box sx={{ mb: 1 }}>
            <Typography
              variant="bodyLarge"
              fontWeight={700}
              color="text.primary"
            >
              {title} - {location}
            </Typography>
          </Box>
          
          {/* Testimonial Text */}
          <Typography
            variant="bodyMedium"
            color="text.primary"
            sx={{
              lineHeight: 1.6,
              flex: 1,
              pr: 1.5,
            }}
          >
            {text}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
