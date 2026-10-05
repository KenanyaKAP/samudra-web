import { Box, Container, Typography } from "@mui/material";
import SDPHistory from "../../components/about/SDPHistory";
import { useSection } from "../../hooks/useSiteData";

function HistoryPage() {
  const { heading, items = [] } = useSection("aboutHistory");

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* Section B — SDP HISTORY                                         */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Container maxWidth="xxl" sx={{ py: 8 }}>
        <Box
          display={"flex"}
          flexDirection={{ xs: "column", md: "row" }}
          gap={6}
          sx={{ mt: 10}}
        >
          <Typography flex={1} display={"block"} variant="headingMedium">
            {heading}
          </Typography>
          <Box flex={2}>
            <SDPHistory
              history={items}
              defaultOpenIndex={items.length - 1}
            />
          </Box>
        </Box>
      </Container>
    </>
  );
}

export default HistoryPage;
