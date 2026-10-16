import { Box } from "@mui/material";
import { cssUrl } from "../../utils/cssUrl";

/**
 * The photo behind the heading fades into the black of the page. Never
 * taller than the page itself (e.g. once a form is replaced by its short
 * success message), so it can not cover the footer.
 */
function HeroBackdrop({ image, photoHeight, totalHeight, position = "center" }) {
  return (
    <Box
      aria-hidden="true"
      sx={{ position: "absolute", top: 0, left: 0, right: 0, height: totalHeight, maxHeight: "100%", overflow: "hidden", bgcolor: "#010000", pointerEvents: "none" }}
    >
      <Box
        sx={{
          height: photoHeight,
          maxHeight: "100%",
          background: `linear-gradient(180deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.3) 45%, #010000 100%), ${cssUrl(image)} ${position} / cover no-repeat`,
        }}
      />
    </Box>
  );
}

export default HeroBackdrop;
