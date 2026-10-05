import { useState, useEffect } from "react";
import { Box, Container, Typography, Grid } from "@mui/material";
import { useParams } from "react-router-dom";
import { FadeScroll } from "../components/ui/FadeScroll";
import MoreReleaseCard from "../components/news/MoreReleaseCard";
import { useNavigation } from "../hooks/useNavigation";
import { useSection } from "../hooks/useSiteData";
import { fetchEventBySlug, fetchMoreEvents } from "../services/wpApi";

/**
 * Event / News Detail Page
 *
 * Layout (matches the provided design):
 * ┌──────────────────────────────────────────────────────────┐
 * │              FULL-WIDTH HERO IMAGE                      │
 * ├──────────────────────────────┬───────────────────────────┤
 * │ Title                       │ More Release              │
 * │ Date                        │ ┌───────────────────────┐ │
 * │                             │ │  card 1               │ │
 * │ Long description content    │ ├───────────────────────┤ │
 * │ paragraph after paragraph   │ │  card 2               │ │
 * │ ...                         │ ├───────────────────────┤ │
 * │                             │ │  card 3               │ │
 * │ < Back to Events & News     │ └───────────────────────┘ │
 * └──────────────────────────────┴───────────────────────────┘
 */
export default function EventDetail() {
  const { slug } = useParams();
  const { navigateWithFade } = useNavigation();
  const { moreHeading } = useSection("news");
  const [event, setEvent] = useState(null);
  const [moreEvents, setMoreEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch event data
  useEffect(() => {
    setLoading(true);
    fetchEventBySlug(slug)
      .then((data) => setEvent(data))
      .catch(() => setEvent(null))
      .finally(() => setLoading(false));
  }, [slug]);

  // Fetch more events when event loads
  useEffect(() => {
    if (!event) return;
    fetchMoreEvents(event.id, 3)
      .then((items) => setMoreEvents(items))
      .catch(() => setMoreEvents([]));
  }, [event]);

  if (loading) {
    return (
      <Container maxWidth="xxl" sx={{ pt: 20, pb: 10 }}>
        <Typography variant="bodyMedium" color="text.secondary">
          Loading...
        </Typography>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container maxWidth="xxl" sx={{ pt: 20, pb: 10 }}>
        <Typography variant="headingMedium">Event not found</Typography>
        <Typography variant="bodyMedium" color="text.secondary" mt={2}>
          The event you're looking for doesn't exist.
        </Typography>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="xxl" sx={{ pt: { xs: 12, md: 14 } }}>
        {/* ═══════════════════════════════════════════════════════════ */}
        {/* Hero Image — full width                                   */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <Box mt={{ xs: 2, md: 3 }}>
          <FadeScroll delay={0.05}>
            <Box
              component="img"
              src={event.coverImage}
              alt={event.title}
              sx={{
                width: "100%",
                aspectRatio: "16/9",
                objectFit: "cover",
                display: "block",
              }}
            />
          </FadeScroll>
        </Box>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* Content + More Release sidebar                            */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <Grid
          container
          spacing={{ xs: 4, md: 6 }}
          sx={{ mt: { xs: 3, md: 5 } }}
        >
          {/* ─── Left: Title + Date + Content + Back link ─── */}
          <Grid size={{ xs: 12, md: 8 }}>
            <FadeScroll delay={0.1}>
              <Typography variant="headingLarge" component="h1">
                {event.title}
              </Typography>
            </FadeScroll>

            <FadeScroll delay={0.15}>
              <Typography
                variant="bodySmall"
                color="text.secondary"
                mt={2}
                mb={4}
                display="block"
              >
                {event.date}
              </Typography>
            </FadeScroll>

            <FadeScroll delay={0.2}>
              <Box>
                {event.contentHtml ? (
                  <Typography
                    variant="bodyMedium"
                    color="text.primary"
                    component="div"
                    sx={{
                      lineHeight: 1.8,
                      mb: 3,
                      wordBreak: "break-word",
                      "& p": { mb: 2 },
                      "& img": { maxWidth: "100%", height: "auto" },
                    }}
                    dangerouslySetInnerHTML={{ __html: event.contentHtml }}
                  />
                ) : (
                  <Typography
                    variant="bodyMedium"
                    color="text.primary"
                    sx={{
                      lineHeight: 1.8,
                      mb: 3,
                      whiteSpace: "pre-line",
                      wordBreak: "break-word",
                    }}
                  >
                    {event.content}
                  </Typography>
                )}
                {/* {event.content.split("\n\n").map((paragraph, i) => (
                ))} */}
              </Box>
            </FadeScroll>

            {/* Back link */}
            <FadeScroll delay={0.25}>
              <Typography
                mt={4}
                variant="bodyMedium"
                color="primary.main"
                sx={{
                  display: "block",
                  cursor: "pointer",
                  mt: 4,
                  mb: 2,
                  "&:hover": { textDecoration: "underline" },
                }}
                onClick={() => navigateWithFade("/events")}
              >
                {"< Back to Events & News"}
              </Typography>
            </FadeScroll>
          </Grid>

          {/* ─── Right: More Release sidebar ─── */}
          <Grid size={{ xs: 12, md: 4 }}>
            <FadeScroll delay={0.15}>
              <Typography variant="headingSmall" mb={3}>
                {moreHeading}
              </Typography>
            </FadeScroll>

            <Box display="flex" flexDirection="column" gap={3} mt={2}>
              {moreEvents.map((item, i) => (
                <FadeScroll key={item.id} delay={0.2 + i * 0.05}>
                  <MoreReleaseCard
                    event={item}
                    onClick={() => navigateWithFade(`/events/${item.slug}`)}
                  />
                </FadeScroll>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Bottom spacing */}
      <Box mb={{ xs: 6, md: 10 }} />
    </>
  );
}
