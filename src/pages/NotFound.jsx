import { useEffect } from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import SectionHeading from "../components/ui/SectionHeading";
import { useNavigation } from "../hooks/useNavigation";
import { useSection } from "../hooks/useSiteData";

/**
 * Any path React Router does not know. WordPress answers the same paths with
 * a 404 status (samudra_spa_status() in theme/functions.php).
 */
export default function NotFound() {
  const { navigateWithFade } = useNavigation();
  const { heading, body, buttonLabel } = useSection("notFound");

  // Most pages never set a title, so put the previous one back on the way out.
  useEffect(() => {
    const previous = document.title;
    document.title = "Page Not Found - Samudra";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <Container maxWidth="xxl" sx={{ py: 8, mt: 10, mb: 10 }}>
      <SectionHeading title={heading} color="text.secondary" />
      <Typography
        mt={4}
        display={"block"}
        variant="bodyLarge"
        color="text.secondary"
      >
        {body}
      </Typography>
      <Box mt={4}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigateWithFade("/")}
          sx={{
            px: 2,
            py: 0.8,
            fontWeight: 700,
            fontSize: "0.8rem",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            borderRadius: 0,
          }}
        >
          {buttonLabel} -&gt;
        </Button>
      </Box>
    </Container>
  );
}
