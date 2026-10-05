import { useState, useEffect } from "react";
import { Box, Typography, Container, Grid } from "@mui/material";
import CareerCard from "../components/career/CareerCard";
import { fetchCareerPositions } from "../services/wpApi";
import SectionHeading from "../components/ui/SectionHeading";
import { useSection } from "../hooks/useSiteData";

export default function Career() {
  const { heading, intro, joinCard } = useSection("career");
  const [openPositions, setOpenPositions] = useState([]);

  useEffect(() => {
    fetchCareerPositions()
      .then((items) => {
        if (items.length > 0) setOpenPositions(items);
      })
      .catch(() => {
        // keep fallback
      });
  }, []);
  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* Section A — Join the Masterminds Behind the Structure            */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Container maxWidth="xxl" sx={{ py: 8, mt: 10 }}>
        <Box
          display={"flex"}
          flexDirection={{ xs: "column", md: "row" }}
          gap={6}
        >
          {/* <Typography flex={1} display={"block"} variant="headingMedium">
            Join the Masterminds Behind the Structure
          </Typography> */}
          <Box flex={1}>
            <SectionHeading title={heading} color="text.secondary" />
          </Box>

          <Box flex={2} display={"flex"} flexDirection={"column"} gap={2}>
            <Typography
              flex={1}
              display={"block"}
              variant="bodyMedium"
              textAlign={"justify"}
            >
              {intro}
            </Typography>
          </Box>
        </Box>
      </Container>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* Section B — Currently open positions            */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {openPositions.length !== 0 ? (
        <Container maxWidth="xxl" sx={{ py: 8 }}>
          {/* <Typography flex={1} display={"block"} variant="headingSmall">
            Currently open positions
          </Typography> */}
          <Box mt={2}>
            <CareerCard openPositions={openPositions} joinCard={joinCard} />
          </Box>
        </Container>
      ) : (
        <Container maxWidth="xxl" sx={{ py: 8 }}>
          <Typography flex={1} display={"block"} variant="headingSmall">
            No open positions at the moment
          </Typography>
        </Container>
      )}
    </>
  );
}
