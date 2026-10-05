import { Box, Typography } from "@mui/material";
import { FadeScroll } from "../ui/FadeScroll";
import ServicesCard from "./ServicesCard";

/**
 * Highlighted projects horizontal scrollable section.
 * Shows related portfolio items in a scrollable row with hover effects.
 *
 * @param {Object} props
 * @param {Object[]} props.projects - Related projects (wpApi portfolio items)
 * @param {string} [props.title="Highlighted Project"] - Section title
 */
function HighlightedProjects({ projects = [], title = "Highlighted Project" }) {
  if (projects.length === 0) return null;

  return (
    <Box>
      <FadeScroll delay={0}>
        <Typography variant="headingMedium" mb={3}>
          {title}
        </Typography>
      </FadeScroll>

      {/* Horizontal scrollable container */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "&::-webkit-scrollbar": { display: "none" },
          pb: 2,
          mx: -1,
          px: 1,
          mt: 4,
        }}
      >
        {projects.map((project, i) => (
          <FadeScroll key={project.id} delay={i * 0.05}>
            <Box
              sx={{
                maxWidth: { xs: "200px", sm: "300px" },
              }}
            >
              <ServicesCard
                title={project.title}
                image={project.coverImage}
                slug={project.slug}
                index={i}
              />
            </Box>
          </FadeScroll>
        ))}
      </Box>
    </Box>
  );
}

export default HighlightedProjects;
