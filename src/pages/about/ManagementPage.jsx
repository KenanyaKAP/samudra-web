import { Box, Container } from "@mui/material";
import SectionHeading from "../../components/ui/SectionHeading";
import PersonGrid from "../../components/about/PersonGrid";
import { useSection } from "../../hooks/useSiteData";

/** /about/management — Site Content → About › Board of Management. */
function ManagementPage() {
  const {
    heroImage,
    directors = {},
    managers = {},
    sales = {},
  } = useSection("aboutManagement");

  return (
    <>
      <Box
        component="img"
        src={heroImage}
        alt="About Samudra"
        sx={{
          width: "100vw",
          maxWidth: "100%",
          height: "500px",
          display: "block",
          objectFit: "cover",
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* BOARD OF DIRECTORS                                     */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Box
        sx={{
          position: "relative",
          py: { xs: 8, md: 12 },
          overflow: "hidden",
        }}
      >
        <Container maxWidth="xxl">
          <SectionHeading title={directors.heading} />
          <PersonGrid
            people={directors.items}
            fallbackImage="/images/about/people/president.png"
          />

          <SectionHeading title={managers.heading} />
          <PersonGrid
            people={managers.items}
            fallbackImage="/images/home/profile.webp"
          />

          <SectionHeading title={sales.heading} />
          <PersonGrid
            people={sales.items}
            fallbackImage="/images/home/profile.webp"
          />
        </Container>
      </Box>
    </>
  );
}

export default ManagementPage;
