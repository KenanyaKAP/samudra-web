import { Box, Typography, Grid } from "@mui/material";
import PlaceIcon from "@mui/icons-material/Place";

/**
 * "Join Our Team" intro card — always the first card. Content comes from
 * Site Content → Career Page → Join Card.
 */
function JoinTeamCard({ card = {} }) {
  const paragraphs = card.paragraphs || [];
  return (
    <Box
      sx={{
        bgcolor: "primary.main",
        p: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        component="img"
        src={card.image}
        alt="Join our team"
        sx={{
          width: "100%",
          aspectRatio: "2/1",
          objectFit: "cover",
          display: "block",
          // border bottom left only
          borderBottomLeftRadius: 24,
        }}
      />
      <Box mt={2}>
        <Typography
          variant="bodyLarge"
          display="block"
          fontWeight={700}
          color="text.light"
        >
          {card.title}
        </Typography>
        {paragraphs.map((paragraph, i) => (
          <Typography
            key={i}
            variant="bodySmall"
            display="block"
            color="text.light"
            sx={{ mt: 1, opacity: 0.9 }}
          >
            {paragraph}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}

/**
 * A single career position card — always shown in expanded (open) state.
 */
function CareerCardItem({ position }) {
  return (
    <Box
      sx={{
        bgcolor: "primary.main",
        p: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Title + type */}
      <Box>
        <Typography
          variant="headingMedium"
          display="block"
          fontWeight={700}
          color="text.light"
          sx={{ textTransform: "uppercase" }}
        >
          {position.title}
        </Typography>
        <Typography
          variant="headingSmall"
          display="block"
          fontWeight={500}
          color="text.light"
          sx={{ opacity: 0.9 }}
        >
          {position.type}
        </Typography>
      </Box>

      {/* Divider */}
      <Box
        sx={{
          borderBottom: "2px solid rgba(255,255,255,0.3)",
          my: 2,
        }}
      />

      {/* Location */}
      <Box display="flex" alignItems="center" gap={0.5}>
        <PlaceIcon sx={{ fontSize: "1rem", color: "text.light" }} />
        <Typography variant="bodyMedium" display="block" color="text.light">
          {position.location}
        </Typography>
      </Box>

      {/* Description */}
      <Box mt={3} flex={1}>
        <Typography
          variant="bodyMedium"
          display="block"
          color="text.light"
          sx={{ opacity: 0.9, whiteSpace: "pre-line", wordBreak: "break-word" }}
        >
          {position.description ||
            "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat."}
        </Typography>
      </Box>

      {/* Apply Now */}
      <Box
        component={position.applyUrl ? "a" : "div"}
        href={position.applyUrl || undefined}
        target={position.applyUrl ? "_blank" : undefined}
        rel={position.applyUrl ? "noopener noreferrer" : undefined}
        sx={{
          mt: 3,
          display: "flex",
          // alignItems: "center",
          alignSelf: "end",
          gap: 1,
          textDecoration: "none",
          cursor: "pointer",
          width: "fit-content",
          "&:hover": { opacity: 0.8 },
        }}
      >
        <Typography
          variant="bodyMedium"
          color="text.light"
          sx={{ fontWeight: 700 }}
        >
          APPLY NOW →
        </Typography>
      </Box>
    </Box>
  );
}

/**
 * Grid of career position cards — all always open.
 * First item is always the "Join Our Team" card.
 *
 * @example
 * <CareerCard openPositions={openPositions} joinCard={career.joinCard} />
 */
function CareerCard({ openPositions, joinCard }) {
  return (
    <Grid container spacing={4}>
      {/* Intro card */}
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <JoinTeamCard card={joinCard} />
      </Grid>

      {/* Dynamic position cards */}
      {openPositions.map((position, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
          <CareerCardItem position={position} />
        </Grid>
      ))}
    </Grid>
  );
}

export default CareerCard;
