import { Box, Grid, Typography } from "@mui/material";

/**
 * Grid of people cards (photo, role, name) used three times on the Board of
 * Management page. A person without a photo shows `fallbackImage`.
 */
function PersonGrid({ people = [], fallbackImage }) {
  return (
    <Grid container spacing={6} mt={8} mb={10} mx={6}>
      {people.map((person, i) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
          <Box
            sx={{
              height: "100%",
              bgcolor: "rgba(0, 0, 0, 0.68)",
              p: 2,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              component="img"
              src={person.image || fallbackImage}
              alt={person.name}
              sx={{
                width: "100%",
                aspectRatio: "1/1",
                objectFit: "cover",
                borderRadius: "0 0 0 56px",
                mb: 2,
              }}
            />

            <Typography
              mt={1.5}
              display="block"
              variant="bodyMedium"
              color="text.light"
              sx={{ opacity: 0.9 }}
            >
              {person.role}
            </Typography>

            <Typography
              display="block"
              variant="headingSmall"
              color="text.light"
              fontWeight={700}
            >
              {person.name}
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}

export default PersonGrid;
