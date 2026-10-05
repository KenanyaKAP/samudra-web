import { Box, Typography, Container } from "@mui/material";
import { FadeScroll } from "../components/ui/FadeScroll";
import { useSection } from "../hooks/useSiteData";
import { filled, officeContactLines } from "../utils/offices";

export default function Contact() {
  const contact = useSection("contact");
  const { offices = {} } = useSection("global");
  const headquarters = offices.headquarter || {};
  const branchOffices = offices.branches || [];

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* Section H — Branch Map "Your Exhibition Partner"              */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Box sx={{ pt: { xs: 8, md: 10 }, mt: 10 }}>
        <Container maxWidth="xxl">
          <FadeScroll>
            <Typography
              variant="headingLarge"
              color="primary.main"
              textAlign="center"
              display="block"
              mb={1}
            >
              {contact.heading}
            </Typography>
          </FadeScroll>
        </Container>
      </Box>
      <Container
        maxWidth={"xxl"}
        disableGutters
        sx={{
          px: 0,
        }}
      >
        {/* Map placeholder with branch markers */}
        <Box
          component={"img"}
          src={contact.mapImage}
          sx={{
            width: "100%",
            objectFit: "cover",
            mt: 6,
            flex: 1,
            pb: { xs: 8, md: 10 },
          }}
        />
      </Container>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* Section A — About US                                         */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Container maxWidth="xxl" sx={{ py: 8 }}>
        <Box
          display={"flex"}
          flexDirection={{ xs: "column", md: "row" }}
          gap={6}
        >
          <Typography flex={1} display={"block"} variant="headingMedium">
            {contact.headquarterLabel}
          </Typography>
          <Box flex={1} display={"flex"} flexDirection={"column"} gap={2}>
            <Typography flex={1} display={"block"} variant="headingMedium">
              {headquarters.city}
            </Typography>
            <Typography
              flex={1}
              display={"block"}
              variant="headingSmall"
              color="primary.main"
            >
              {headquarters.company}
            </Typography>
            <Typography flex={1} display={"block"} variant="bodyMedium">
              {filled(headquarters.address).map((line, i) => (
                <Box key={line + i} component="span" display="block">
                  {line}
                </Box>
              ))}
            </Typography>
            <Typography flex={1} display={"block"} variant="bodyMedium">
              {officeContactLines(headquarters).map((line, i) => (
                <Box key={line + i} component="span" display="block">
                  {line}
                </Box>
              ))}
            </Typography>
          </Box>
          <Box
            flex={1}
            display={"flex"}
            position={"relative"}
            overflow={"hidden"}
          >
            <Box
              component={"img"}
              src={contact.headquarterMapImage}
              alt="Map Location"
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </Box>
        </Box>
      </Container>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* Section B — Branch Office                                         */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Container maxWidth="xxl" sx={{ pb: 8 }}>
        <Box
          display={"flex"}
          flexDirection={{ xs: "column", md: "row" }}
          gap={6}
        >
          <Typography flex={1} display={"block"} variant="headingMedium">
            {contact.branchLabel}
          </Typography>
          {branchOffices.slice(0, 2).map((office) => (
            <Box
              key={office.city}
              flex={1}
              display={"flex"}
              flexDirection={"column"}
              gap={2}
            >
              <Typography flex={1} display={"block"} variant="headingMedium">
                {office.city}
              </Typography>
              <Typography flex={1} display={"block"} variant="bodyMedium">
                {[...filled(office.address), ...officeContactLines(office)].map((line, i) => (
                  <Box key={line + i} component="span" display="block">
                    {line}
                  </Box>
                ))}
              </Typography>
            </Box>
          ))}
        </Box>
        <Box
          mt={6}
          display={"flex"}
          flexDirection={{ xs: "column", md: "row" }}
          gap={6}
        >
          <Box flex={1} />
          {branchOffices.slice(2).map((office) => (
            <Box
              key={office.city}
              flex={1}
              display={"flex"}
              flexDirection={"column"}
              gap={2}
            >
              <Typography flex={1} display={"block"} variant="headingMedium">
                {office.city}
              </Typography>
              <Typography flex={1} display={"block"} variant="bodyMedium">
                {[...filled(office.address), ...officeContactLines(office)].map((line, i) => (
                  <Box key={line + i} component="span" display="block">
                    {line}
                  </Box>
                ))}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </>
  );
}
